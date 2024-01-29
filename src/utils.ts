import type { SettleOptions } from "./types";

export class PayloadError<TPayload> extends Error {
  constructor(error: string, public payload: TPayload) {
    super(error);
  }
}

const defaultOptions: SettleOptions = {
  concurrency: 1,
  onFail: {
    attempts: 0,
    delay: 0,
  },
  omitResult: false,
};

export const mergeOptions = (
  options: Partial<SettleOptions> | number,
  oldOptions = defaultOptions
): SettleOptions => {
  if (typeof options === "number") {
    return { ...oldOptions, concurrency: options };
  }

  return {
    ...oldOptions,
    ...options,
    onFail: {
      attempts: options.onFail?.attempts ?? 0,
      ...oldOptions.onFail,
      ...options.onFail,
    },
  };
};

export const delay = (ms: number): Promise<number> =>
  new Promise((resolve) => setTimeout(() => resolve(ms), ms));
