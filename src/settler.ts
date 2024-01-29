import pLimit, { type Limit } from "p-limit";
import { PayloadError, delay } from "./utils";
import type { SettleOptions, PayloadType, Result, Callback } from "./types";
import EventEmitter from "./emitter";

class Settler<T, R> {
  private readonly promises: Promise<
    ReturnType<typeof this.limit> | unknown
  >[] = [];
  private processed = 0;

  public readonly result: Result<T, R> | undefined;
  public readonly limit: Limit;

  public readonly events = new EventEmitter<T, R>();
  public promise = Promise.all(this.promises);

  constructor(public readonly options: SettleOptions) {
    this.validateOptions(options);
    this.limit = pLimit(options.concurrency);

    if (!this.options.omitResult) {
      this.result = { values: [], errors: [] };
    }
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

  private handleItem(
    item: T,
    index: number,
    fn: Callback<T, R>,
    retry = this.options?.onFail?.attempts || 0
  ) {
    return async (): Promise<void> => {
      try {
        const value = await fn(item, index);
        this.events.emit("resolve", { value, item, index });
        this.result?.values.push(value);
      } catch (error) {
        if (retry >= 1) {
          this.events.emit("retry", {
            error: error as Error,
            item,
            index,
            tried: (this.options.onFail?.attempts ?? retry) - retry + 1,
          });

          this.options.onFail?.delay &&
            (await delay(this.options.onFail.delay));

          return this.handleItem(item, index, fn, retry - 1)();
        }

        this.result?.errors.push(
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
      } finally {
        this.processed++;

        if (this.processed === this.promises.length) {
          !this.options.omitResult &&
            this.events.emit("complete", this.result as Result<T, R>);
          this.events.destroy();
          this.processed = 0;
        }
      }
    };
  }

  async settle(items: T[], fn: Callback<T, R>) {
    for (const [index, item] of items.entries()) {
      this.promises.push(this.limit(this.handleItem(item, index, fn)));
    }

    this.promise = Promise.all(this.promises);
    await this.promise;

    return this.result;
  }
}

export default Settler;
