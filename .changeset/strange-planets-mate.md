---
"settle-map": major
---

# Update: Enhanced Response Handling

- Removed the `all` getter in this release. With `settleMap` now returning a `Thenable` object, you can use the more intuitive `await` syntax without `all`.
- Added a new `omitResult` option to prevent result storage. This is useful for saving memory when using the event-driven `on` function or when you would like to ignore it.
- Implemented function overriding to manage the map function response based on the `omitResult` value.
- Renamed the `stop` function to `abort` for clarity.
- Introduced a new curry function, `createSettleMap`, to simplify code and adhere to the `DRY` (Don't Repeat Yourself) principle.
