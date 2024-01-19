<h1 align="center">Settle Map</h1>

Settle Map is a tool that combines the features of `Promise.allSettled` and `Array.map`. It simplifies the process of mapping promises and lets you control how many can run at the same time using concurrency.

## How it works

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

Get response on resolve any item immediately

```ts
settled.on("resolve", ({ value, index }) => {
  // your actions
});
```

Get result immediately on reject any item

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

### Stop all process when you want

you could stop the all process any time and get the current result using `stop` function

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

### Retry control on reject or fail promises

You could specify a retry limit and delay for each promise, in case it fails or is rejected.

```ts
const options = {
  concurrency: 2,
  onFail: {
    attempts: 3, // the number of attempts on fail
    delay: 2000, // ms
  },
};
const settled = settleMap(items, asyncMapFunction, options);
```
