import type { SettleOptions } from "./types";
import { mergeOptions } from "./utils";
import Settler from "./settler";

const settleMap = <T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  options: SettleOptions | number = 1
) => {
  const settler = new Settler<T, R>(mergeOptions(options));
  const promise = settler.settle(items, fn);

  return {
    get all() {
      return promise;
    },
    waitUntilFinished: () => settler.waitUntilFinished(),
    status() {
      return settler.status;
    },
    on: settler.on.bind(settler),
    stop: () => settler.stop(),
  };
};

export default settleMap;
