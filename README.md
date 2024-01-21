# Settle Map

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/fahimfaisaal/settle-map/.github%2Fworkflows%2Fmain.yml?branch=main&style=flat&logo=github-actions&label=CI) ![NPM Downloads](https://img.shields.io/npm/dw/settle-map?style=flat&logo=npm&logoColor=red&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fsettle-map) ![GitHub Repo stars](https://img.shields.io/github/stars/fahimfaisaal/settle-map?style=flat&logo=github&link=https%3A%2F%2Fgithub.com%2Ffahimfaisaal%2Fsettle-map)

Settle Map is a tool that combines the features of `Promise.allSettled` and `Array.map`. It simplifies the process of mapping promises and lets you control how many can run at the same time using concurrency. In other words, it will help you prevent being rate-limited.

## ⚙️ Installation

```bash
npm i settle-map
```

## 📚 How it works

```ts
import settleMap from "settle-map";

const items = [1, 2, 3, 4, 5];

const settled = settleMap(
  items, // your items
  async (item, index) => {
    // your async map function
    if (item % 2 === 0) throw new Error("Even error");

    return item;
  },
  2 // the concurrency you want to set
);
```

### Get live response by listening events

Get response value on resolve any item immediately

```ts
settled.on("resolve", ({ value, index }) => {
  // your actions
});
```

Catch error immediately on reject any item

```ts
settled.on("reject", ({ error, item, index }) => {
  // your actions
});
```

Get response immediately on retry any item

```ts
settled.on("retry", ({ error, retry, item, index }) => {
  // your actions
});
```

Get the final result object

```ts
settled.on("complete", ({ values, error }) => {
  // your actions
});
```

> [!NOTE]
> Each event can only trigger one function. If you try to set up multiple listeners for the same event, the most recent one will replace any earlier ones.

### Get the final result at once

To wait and get all result at once an `all` getter return you the universal resolved promise

```ts
const result = await settled.all; // An universal resolved promise
console.log(result);
/* output
{
  values: [1, 3, 5],
  errors: PayloadError[] // this errors returns array of error with payload { item, index } so you could know where the error happened
}
*/
```

### Wait Until All Processes Are Done

If you want to wait until all processes are done, you can use the `.waitUntilFinished` method.

```ts
await settled.waitUntilFinished(); // will return always a resolved promise
```

### Stop all process when you want

you could stop the all process any time and get the current result using `stop` method

```ts
const result = settled.stop();
```

### Get real time status

you could watch the updated status using `status` method that will return the number of active and pending process

```ts
const status = settled.status();
console.log(status);

/* 
{
  activeCount: number
  pendingCount: number
}
*/
```

### Retry options on reject or fail promises

You could specify a retry limit and delay for each promise, in case it fails or is rejected.

```ts
const options = {
  concurrency: 2,
  onFail: {
    attempts: 3, // the number of attempts on fail
    delay: 2000, // ms
  },
};
const settled = settleMap(items, asyncMapmethod, options);
```

## 📖 API Reference

### `settleMap(items, fn, options)`

A function that settles promises returned by the provided function (`fn`) for each item in the `items` array. The promises are settled according to the provided `options`.

#### Parameters

- `items` (`T[]`): An array of items to be processed.
- `fn` (`(item: T, index: number) => Promise<R>`): A function that takes an item and its index as parameters and returns a Promise.
- `options` (`SettleOptions | number`): An object that specifies the concurrency and retry options. If a number is provided, it is treated as the concurrency level.

#### Return Value

Returns an object with the following properties and methods:

- `all`: A promise that resolves when all items have been processed. The promise resolves to an array of results in the same order as the input items.
- `waitUntilFinished()`: A method that returns a promise that resolves when all items have been processed, regardless of whether they succeeded or failed.
- `status()`: A method that returns the current status of the settling process.
- `on(event, listener)`: A method that allows you to listen for certain events.
- `stop()`: A method that stops the settling process and return the current result.

## 👤 Author (Fahim Faisaal)

- GitHub: [@fahimfaisaal](https://github.com/fahimfaisaal)
- Twitter: [@FahimFaisaal](https://twitter.com/FahimFaisaal)
- LinkedIn: [in/fahimfaisaal](https://www.linkedin.com/in/fahimfaisaal/)
