# settle-map

## 2.0.1

### Patch Changes

- bd6373b: Removed mjs build from the lib and improved the readme

  - removed changelog from the npm
  - improved and fixed readme

## 2.0.0

### Major Changes

- e69672b: Enhanced Response Handling

  - Removed the `all` getter in this release. With `settleMap` now returning a `Thenable` object, you can use the more intuitive `await` syntax without `all`.
  - Added a new `omitResult` option to prevent result storage. This is useful for saving memory when using the event-driven `on` function or when you would like to ignore it.
  - Implemented function overriding to manage the map function response based on the `omitResult` value.
  - Renamed the `stop` function to `abort` for clarity.
  - Introduced a new curry function, `createSettleMap`, to simplify code and adhere to the `DRY` (Don't Repeat Yourself) principle.

## 1.2.0

### Minor Changes

- de2ad41: Add item with parameters on emit resolve event

## 1.1.1

### Patch Changes

- 86e0576: downgraded the p-limit version for module export/import issue

## 1.1.0

### Minor Changes

- 9cf245f: Add new waitUntilFinished method

## 1.0.1

### Patch Changes

- 713d887: Include options validator and made delay optional explicitly

## 1.0.0

### Major Changes

- d845d66: First initial version release 🥳
