import { test, expect } from "vitest";
import { PayloadError, mergeOptions } from "../src/utils";

test("should create an instance of PayloadError", () => {
  const payload = { text: "test", number: 2 };
  const error = new PayloadError("test", payload);

  expect(error).toBeInstanceOf(PayloadError);
  expect(error.message).toBe("test");
  expect(error.payload).toEqual(payload);
});

test("should merge options correctly with number only", () => {
  const options = mergeOptions(2);

  expect(options.concurrency).toBe(2);
  expect(options.onFail?.attempts).toBe(0);
  expect(options.onFail?.delay).toBe(0);
  expect(options.omitResult).toBe(false);
});

test("should merge options correctly with object", () => {
  const options = mergeOptions({
    onFail: {
      attempts: 2,
      delay: 1000,
    },
    omitResult: true,
  });

  expect(options.concurrency).toBe(1);
  expect(options.onFail?.attempts).toBe(2);
  expect(options.onFail?.delay).toBe(1000);
  expect(options.omitResult).toBe(true);
});

/**
 * how to run test
 * version traking on challenge feature
 * lerna version patch
 */
