import type { SettleOptions } from "./types";

export class PayloadError<TPayload> extends Error {
  constructor(error: string, public payload: TPayload) {
    super(error);
  }
}

export const mergeOptions = (
  options: SettleOptions | number
): SettleOptions => {
  const defaultOptions = {
    concurrency: 1,
    onFail: {
      attempts: 0,
      delay: 0,
    },
    omitResult: false,
  };

  if (typeof options === "number") {
    return { ...defaultOptions, concurrency: options };
  }

  return {
    ...defaultOptions,
    ...options,
    onFail: {
      ...defaultOptions.onFail,
      ...options.onFail,
    },
  };
};

export const delay = (ms: number): Promise<number> =>
  new Promise((resolve) => setTimeout(() => resolve(ms), ms));
