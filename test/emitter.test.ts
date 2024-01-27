import { it, test, expect, describe, vi } from "vitest";
import EventEmitter from "../src/emitter";
import { PayloadError } from "../src/utils";

test("should create an instance of EventEmitter", () => {
  const emitter = new EventEmitter<string, number>();
  expect(emitter).toBeInstanceOf(EventEmitter);
});

test("should initialize with an empty listeners object", () => {
  const emitter = new EventEmitter<string, number>();
  expect(emitter.listeners).toEqual({});
});

describe("it all emit methods", () => {
  const emitter = new EventEmitter<string, number>();
  const payloads = {
    resolve: {
      value: 123,
      item: "it",
      index: 0,
      status: { activeCount: 0, pendingCount: 0 },
    },
    reject: {
      error: new Error("it"),
      item: "it",
      index: 0,
      status: { activeCount: 0, pendingCount: 0 },
    },
    retry: {
      error: new Error("it"),
      item: "it",
      index: 0,
      retry: 0,
      status: { activeCount: 0, pendingCount: 0 },
    },
    complete: {
      values: [123, 23],
      errors: [
        new PayloadError("it", {
          item: 23,
          index: 1,
        }),
      ],
    },
  };

  it("should return undefined while no listener subscribed", () => {
    expect(emitter.emit("resolve", payloads.resolve)).toBeUndefined();
    expect(emitter.emit("reject", payloads.reject)).toBeUndefined();
    expect(emitter.emit("retry", payloads.retry)).toBeUndefined();
    expect(
      emitter.emit("complete", payloads.complete as never)
    ).toBeUndefined();
  });

  it("should return null when listener throw errors", () => {
    const mockErrorListener = () => {
      throw new Error("move error");
    };

    emitter.listeners["resolve"] = mockErrorListener;
    emitter.listeners["reject"] = mockErrorListener;
    emitter.listeners["retry"] = mockErrorListener;
    emitter.listeners["complete"] = mockErrorListener;

    expect(emitter.emit("resolve", payloads.resolve)).toBeNull();
    expect(emitter.emit("reject", payloads.reject)).toBeNull();
    expect(emitter.emit("retry", payloads.retry)).toBeNull();
    expect(emitter.emit("complete", payloads.complete as never)).toBeNull();
  });

  const mockListenerFunc = vi.fn();

  it("should call the listener with correct payload when the resolve event is emitted", () => {
    emitter.listeners["resolve"] = mockListenerFunc;

    emitter.emit("resolve", payloads.resolve);
    expect(mockListenerFunc).toHaveBeenCalledWith(payloads.resolve);
  });

  it("should call the listener with correct payload when the reject event is emitted", () => {
    emitter.listeners["reject"] = mockListenerFunc;

    emitter.emit("reject", payloads.reject);
    expect(mockListenerFunc).toHaveBeenCalledWith(payloads.reject);
  });

  it("should call the listener with correct payload when the retry event is emitted", () => {
    emitter.listeners["retry"] = mockListenerFunc;

    emitter.emit("retry", payloads.retry);
    expect(mockListenerFunc).toHaveBeenCalledWith(payloads.retry);
  });

  it("should call the listener with correct payload when the complete event is emitted", () => {
    emitter.listeners["complete"] = mockListenerFunc;

    emitter.emit("complete", payloads.complete as never);
    expect(mockListenerFunc).toHaveBeenCalledWith(payloads.complete);
  });
});
