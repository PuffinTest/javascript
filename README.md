# PuffinTest for JavaScript

PuffinTest is an early Node.js test-case library with named cases, deep equality and truth checks, explicit failure, sequential execution, and readable failure reports. The runner supports synchronous and asynchronous callbacks and returns a process status code.

This package is under development and has not been published to npm. Its API and setup instructions may change. The initial implementation targets Node.js 20 or newer.

## Example

```js
import { expectEqual, runTests, test } from 'puffintest';

const cases = [
  test('greets the user', () => {
    expectEqual('hello'.toUpperCase(), 'HELLO');
  }),
];

process.exitCode = await runTests(cases);
```

From this directory, run the included example with `npm run example`. For local development, import from `./src/index.js` as the example does. A failed expectation stops that case, while later cases still run. Reports include the case, message, expected and actual values where available, and a JavaScript stack location. `runTests` returns `0` if all selected cases pass and `1` if a case fails or no cases match.

## API

- `test(name, callback, { tags?, skipReason? })` declares a named case. Callbacks may be synchronous or asynchronous.
- `expectEqual(actual, expected, message?)` compares values using Node's deep strict equality.
- `expectNotEqual(actual, unexpected, message?)` checks that values differ.
- `expectTrue(actual, message?)` checks truthiness.
- `expectContains(container, item, message?)` checks the container's native `includes` method.
- `expectThrows(callback, ErrorClassOrPredicate?, message?)` checks a synchronous callback for an exception.
- `fail(message?)` explicitly fails the current case.
- `runTests(cases, { filter?, tag?, failFast?, beforeEach?, afterEach? })` runs cases sequentially, prints a summary, and returns `0` or `1`. Filters ignore case; tag matching is exact. Hooks may be asynchronous.

This implementation is Node.js-specific because it uses Node's value inspection and deep equality utilities. Discovery and browser support are not implemented yet.
