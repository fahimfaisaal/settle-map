import { PayloadError } from "./utils";

export type SettleOptions = {
  concurrency: number;
  onFail?: {
    attempts: number;
    delay?: number;
  };
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

export type EventListener<T, R, E extends keyof Listener<T, R>> = (
  payload: Parameters<NonNullable<Listener<T, R>[E]>>[0]
) => void;

export type PayloadType<T> = { item: T; index: number };

export type ReturnType<T, R> = {
  values: R[];
  errors: PayloadError<PayloadType<T>>[];
};

export type Emit<T, R> = (
  event: keyof Listener<T, R>,
  args: Parameters<NonNullable<Listener<T, R>[keyof Listener<T, R>]>>[0]
) => void;

export type Callback<T, R> = (item: T, index: number) => Promise<R>;
