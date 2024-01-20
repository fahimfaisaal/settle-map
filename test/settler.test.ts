import { expect, it, describe, test, vi, beforeEach } from "vitest";
import Settler from "../src/settler";
import { PayloadError } from "../src/utils";
import type { Result } from "../src/types";

test("should validate options correctly", () => {
  expect(() => {
    new Settler({ concurrency: 0 });
  }).toThrowError(new RangeError("Concurrency must be at least 1"));

  expect(() => {
    new Settler({ concurrency: 1, onFail: { attempts: -1 } });
  }).toThrowError(new RangeError("Attempts must be at least 0"));

  expect(() => {
    new Settler({ concurrency: 1, onFail: { attempts: 1, delay: -1 } });
  }).toThrowError(new RangeError("Delay must be at least 0"));
});

describe("Settler class", () => {
  const optionsIter = [1, 1, 2, 3, 4, 5].values();
  let settler: Settler<number, number>;

  beforeEach(() => {
    settler = new Settler<number, number>({
      concurrency: optionsIter.next().value,
    });
  });

  it("should create an instance of EventEmitter", () => {
    expect(settler).toBeInstanceOf(Settler);
  });

  it("should correctly initialize Settler with options", () => {
    expect(settler.options.concurrency).toBe(1);
    expect(settler.options.onFail?.attempts).toBeUndefined();
    expect(settler.options.onFail?.delay).toBeUndefined();
  });

  it("should return correct status", () => {
    const status = settler.status;
    expect(status.activeCount).toBe(0);
    expect(status.pendingCount).toBe(0);
  });

  it("should clear the queue", async () => {
    await settler.settle([1, 2, 3], async (item) => item);
    settler.stop();
    expect(settler.status.pendingCount).toBe(0);
    expect(settler.status.activeCount).toBe(0);
  });

  it("should settle promises and return results", async () => {
    const res = await settler.settle([1, 2, 3, 4, 5], async (item) => item * 2);
    expect(res.values).toEqual([2, 4, 6, 8, 10]);
    expect(res.errors).toEqual([]);
  });

  it("should emit all events correctly", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const valuesAndErrors = items.map((item, index) => {
      if (item % 2 !== 0) {
        return item * 2;
      }

      return new PayloadError("test", { item, index });
    });
    const valuesIter = valuesAndErrors
      .filter((value) => !(value instanceof PayloadError))
      .values();
    const errorsIter = valuesAndErrors
      .filter((value) => value instanceof PayloadError)
      .values();

    const resolveMockFunc = vi.fn();
    const rejectMockFunc = vi.fn();
    const completeMockFunc = vi.fn();

    settler.on("resolve", resolveMockFunc);
    settler.on("reject", rejectMockFunc);
    settler.on("complete", completeMockFunc);

    await settler.settle(items, async (item) => {
      if (item % 2 !== 0) {
        return item * 2;
      }

      throw new Error("test");
    });

    resolveMockFunc.mock.calls.forEach((call) => {
      expect(call[0].value).toBe(valuesIter.next().value);
    });

    rejectMockFunc.mock.calls.forEach((call) => {
      expect(call[0].error).toBeInstanceOf(Error);
      const { value } = errorsIter.next();

      expect(call[0].item).toBe(value.payload.item);
      expect(call[0].index).toBe(value.payload.index);
    });

    expect(completeMockFunc).toHaveBeenCalledWith(
      valuesAndErrors.reduce(
        (result, value) => {
          if (value instanceof PayloadError) {
            result.errors.push(value);
          } else {
            result.values.push(value);
          }

          return result;
        },
        { values: [], errors: [] } as Result<number, number>
      )
    );
  });
});
