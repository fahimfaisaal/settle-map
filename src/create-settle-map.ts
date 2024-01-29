import settleMap from ".";
import type { SettleOptions } from "./types";
import { mergeOptions } from "./utils";

const createSettleMap =
  (defaultOption: SettleOptions) =>
  <T, R>(
    items: T[],
    fn: (item: T, index: number) => Promise<R>,
    newOption?: number | Partial<SettleOptions>
  ) =>
    settleMap(
      items,
      fn,
      mergeOptions(newOption ?? defaultOption, defaultOption)
    );

export default createSettleMap;
