import type { Emit, Listener } from "./types";

class EventEmitter<T, R> {
  public readonly listeners: Listener<T, R> = {};

  public readonly emit: Emit<T, R> = (event, args) => {
    try {
      return this.listeners[event]?.(args as never);
    } catch {
      return null;
    }
  };
}

export default EventEmitter;
