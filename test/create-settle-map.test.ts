import { it, test, expect, describe, vi, beforeEach } from "vitest";
import { createSettleMap } from "../src";
import { PayloadError } from "../src/utils";
import type { Result } from "../src/types";

test("should create a function", () => {
  expect(createSettleMap).toBeInstanceOf(Function);
});

describe("Test functionalities of createSettleMap", () => {
  let map: ReturnType<typeof createSettleMap>;

  beforeEach(() => {
    map = createSettleMap({
      concurrency: 5,
    });
  });

  it("should work despite no options passed", async () => {
    expect(await map([1, 2, 3], async (item) => item)).toEqual({
      values: [1, 2, 3],
      errors: [],
    });
  });

  it("should work with merge options", async () => {
    expect(
      await map([1, 2, 3], async (item) => item, { omitResult: true })
    ).toBeUndefined();
    expect(await map([1, 2, 3], async (item) => item, 2)).toEqual({
      values: [1, 2, 3],
      errors: [],
    });
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

    const settled = map(items, async (item) => {
      if (item % 2 !== 0) {
        return item * 2;
      }

      throw new Error("test");
    });

    settled.on("resolve", resolveMockFunc);
    settled.on("reject", rejectMockFunc);
    settled.on("complete", completeMockFunc);

    await settled.waitUntilFinished();

    resolveMockFunc.mock.calls.forEach((call) => {
      expect(call[0].value).toBe(valuesIter.next().value);
    });

    rejectMockFunc.mock.calls.forEach((call) => {
      expect(call[0].error).toBeInstanceOf(Error);
      const { value } = errorsIter.next();

      expect(call[0].item).toBe(value?.payload.item);
      expect(call[0].index).toBe(value?.payload.index);
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
