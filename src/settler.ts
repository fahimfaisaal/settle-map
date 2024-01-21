import pLimit, { type LimitFunction } from "p-limit";
import { PayloadError, delay } from "./utils";
import type {
  SettleOptions,
  PayloadType,
  Listener,
  EventListener,
  Result,
  Callback,
} from "./types";
import EventEmitter from "./emitter";

class Settler<T, R> {
  private readonly promises: Promise<
    ReturnType<typeof this.limit> | unknown
  >[] = [];
  private readonly result: Result<T, R> = {
    values: [],
    errors: [],
  };
  private readonly events = new EventEmitter<T, R>();
  private readonly limit: LimitFunction;

  constructor(public readonly options: SettleOptions) {
    this.validateOptions(options);
    this.limit = pLimit(options.concurrency);
  }

  get status() {
    return {
      activeCount: this.limit.activeCount,
      pendingCount: this.limit.pendingCount,
    };
  }

  private validateOptions(options: SettleOptions) {
    if (options.concurrency < 1) {
      throw new RangeError("Concurrency must be at least 1");
    }

    if (Number(options.onFail?.attempts) < 0) {
      throw new RangeError("Attempts must be at least 0");
    }

    if (Number(options.onFail?.delay) < 0) {
      throw new RangeError("Delay must be at least 0");
    }
  }

  public stop() {
    this.limit.clearQueue();

    return this.result;
  }

  public async waitUntilFinished() {
    await Promise.all(this.promises);
  }

  private handleItem(
    item: T,
    index: number,
    fn: Callback<T, R>,
    retry = this.options?.onFail?.attempts || 0
  ) {
    return async (): Promise<void> => {
      try {
        const value = await fn(item, index);
        this.events.emit("resolve", { value, index });
        this.result.values.push(value);
      } catch (error) {
        if (retry >= 1) {
          this.events.emit("retry", {
            error: error as Error,
            item,
            index,
            retry,
          });

          this.options.onFail?.delay &&
            (await delay(this.options.onFail.delay));

          return this.handleItem(item, index, fn, retry - 1)();
        }

        this.result.errors.push(
          new PayloadError<PayloadType<T>>((error as Error).message, {
            item,
            index,
          })
        );
        this.events.emit("reject", {
          error: error as Error,
          item,
          index,
        });
      }
    };
  }

  async settle(items: T[], fn: Callback<T, R>) {
    for (const [index, item] of items.entries()) {
      this.promises.push(this.limit(this.handleItem(item, index, fn)));
    }

    await Promise.all(this.promises);
    this.events.emit("complete", this.result);
    return this.result;
  }

  public on<E extends keyof Listener<T, R>>(
    event: E,
    listener: EventListener<T, R, E>
  ) {
    this.events.listeners[event] = listener;
  }
}

export default Settler;
