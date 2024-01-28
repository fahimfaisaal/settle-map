import { PayloadError } from "./utils";

export type SettleOptions = {
  concurrency: number;
  onFail?: {
    attempts: number;
    delay?: number;
  };
  omitResult?: boolean;
};

export type StatusType = {
  activeCount: number;
  pendingCount: number;
};

export interface Listener<T, R> {
  resolve?: (payload: { value: R; item: T; index: number }) => void;
  reject?: (payload: { error: Error; item: T; index: number }) => void;
  retry?: (payload: {
    error: Error;
    item: T;
    index: number;
    retry: number;
  }) => void;
  complete?: (payload: ReturnType<T, R>) => void;
}

export type Result<T, R> = {
  values: R[];
  errors: PayloadError<PayloadType<T>>[];
};

export type PayloadType<T> = { item: T; index: number };

export type ReturnType<T, R> = {
  values: R[];
  errors: PayloadError<PayloadType<T>>[];
};

export type Callback<T, R> = (item: T, index: number) => Promise<R>;

export type ReturnObjectType<T, R> = {
  waitUntilFinished(): Promise<void>;
  status(): { activeCount: number; pendingCount: number };
  on: <K extends keyof Listener<T, R>>(
    event: K,
    listener: Listener<T, R>[K]
  ) => void;
};
