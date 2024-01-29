import type { Listener } from "./types";

class EventEmitter<T, R> {
  public listeners: Listener<T, R> | null = null;

  constructor() {
    this.listeners = {};
  }

  public readonly emit = <E extends keyof Listener<T, R>>(
    event: E,
    args: Parameters<NonNullable<Listener<T, R>[E]>>[0]
  ) => {
    try {
      return this.listeners?.[event]?.(args as never);
    } catch {
      return null;
    }
  };

  public on<E extends keyof Listener<T, R>>(
    event: E,
    listener: (payload: Parameters<NonNullable<Listener<T, R>[E]>>[0]) => void
  ) {
    if (!this.listeners) return;

    this.listeners[event] = listener;
  }

  public destroy() {
    this.listeners = null;
  }
}

export default EventEmitter;
