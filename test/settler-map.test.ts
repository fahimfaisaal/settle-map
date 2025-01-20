import { test, expect, vi } from "vitest";
import settleMap from "../src";
import { PayloadError } from "../src/utils";
import type { Result } from "../src/types";

test("should settle promises and return results", async () => {
  const items = [1, 2, 3, 4, 5];
  const settle = settleMap(items, async (item) => item);

  expect(settle.abort).instanceOf(Function);
  expect(settle.on).instanceOf(Function);
  expect(settle.waitUntilFinished).instanceOf(Function);
  expect(settle.status).instanceOf(Function);
  expect(await settle).toEqual({
    values: items,
    errors: [],
  });
});

test("should return undefined when omitResult is true", async () => {
  const items = [1, 2, 3, 4, 5];
  const settle = settleMap(items, async (item) => item, {
    omitResult: true,
    concurrency: 3,
  });

  expect(await settle).toBeUndefined();
});

test("should settle promises and return results with all method", async () => {
  const items = [1, 2, 3, 4, 5];
  const result = await settleMap(items, async (item) => item, 2);

  expect(result).toEqual({
    values: items,
    errors: [],
  });
});

test("should return correct status", () => {
  const items = [1, 2, 3, 4, 5];
  const settle = settleMap(items, async (item) => item);

  expect(settle.status().pendingCount).toBe(5);
  expect(settle.status().activeCount).toBe(0);

  settle.abort();

  expect(settle.status().pendingCount).toBe(0);
  expect(settle.status().activeCount).toBe(0);
});

test("should emit all events correctly", async () => {
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

  const settle = settleMap(items, async (item) => {
    if (item % 2 !== 0) {
      return item * 2;
    }

    throw new Error("test");
  });

  settle.on("resolve", resolveMockFunc);
  settle.on("reject", rejectMockFunc);
  settle.on("complete", completeMockFunc);

  await settle.waitUntilFinished();

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
