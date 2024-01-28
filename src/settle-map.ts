import type { ReturnObjectType, Result, SettleOptions } from "./types";
import { mergeOptions } from "./utils";
import Settler from "./settler";

// return void incase omitResult is true
function settleMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  options: SettleOptions & { omitResult: true }
): ReturnObjectType<T, R> & {
  then: (onfulfilled?: (value: undefined) => unknown) => Promise<unknown>;
  abort: () => undefined;
};

// return result object incase omitResult is false or undefined
function settleMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  options?: number | (SettleOptions & { omitResult?: false | undefined })
): ReturnObjectType<T, R> & {
  then: (onfulfilled?: (value: Result<T, R>) => unknown) => Promise<unknown>;
  abort: () => Result<T, R>;
};

function settleMap<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  options: SettleOptions | number = 1
) {
  const settler = new Settler<T, R>(mergeOptions(options));
  const promise = settler.settle(items, fn);

  return {
    waitUntilFinished: async () => {
      await settler.promise;
    },
    status() {
      return {
        activeCount: settler.limit.activeCount,
        pendingCount: settler.limit.pendingCount,
      };
    },
    on: settler.events.on.bind(settler.events),
    abort: () => {
      settler.limit.clearQueue();
      settler.events.destroy();

      return settler.result;
    },
    then(onfulfilled?: (value: Result<T, R> | undefined) => unknown) {
      return promise.then(onfulfilled);
    },
  };
}

export default settleMap;
