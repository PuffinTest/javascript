# PuffinTest for JavaScript

PuffinTest is an early Node.js test-case library with named cases, deep equality, inclusive numeric range and truth checks, explicit failure, sequential execution, and readable failure reports. The runner supports synchronous and asynchronous callbacks and returns a process status code.

This package is under development and has not been published to npm. Its API and setup instructions may change. The initial implementation targets Node.js 20 or newer.

## Example

```js
import { expectBetween, expectEqual, expectLength, expectStartsWith, runTests, test } from 'puffintest';

const cases = [
  test('greets the user', () => {
    expectEqual('hello'.toUpperCase(), 'HELLO');
    expectLength(['north', 'south'], 2);
    expectStartsWith('puffin test', 'puffin');
    expectBetween(18, 13, 19);
  }),
];

process.exitCode = await runTests(cases);
```

From this directory, run the included example with `npm run example`. For local development, import from `./src/index.js` as the example does. A failed expectation stops that case, while later cases still run. Reports include the case, message, expected and actual values where available, and a JavaScript stack location. `runTests` returns `0` if all selected cases pass and `1` if a case fails or no cases match.

## API

- `test(name, callback, { tags?, skipReason? })` declares a named case. Callbacks may be synchronous or asynchronous.
- `expectEqual(actual, expected, message?)` compares values using Node's deep strict equality.
- `expectNotEqual(actual, unexpected, message?)` checks that values differ.
- `expectClose(actual, expected, { relTol?, absTol?, message? })` checks approximate numeric equality.
- `expectGreaterThan` and `expectLessThan` check strict thresholds; `expectAtLeast` and `expectAtMost` accept equality at the threshold.
- `expectBetween(actual, minimum, maximum, message?) checks an inclusive numeric range and requires numeric values with ordered bounds.
- `expectTrue(actual, message?)` checks truthiness.
- `expectFalse(actual, message?)` checks falsehood.
- `expectNull(actual, message?)` and `expectNotNull(actual, message?)` check for exactly `null`. `undefined` is distinct and passes `expectNotNull`.
- `expectContains(container, item, message?)` checks arrays, strings, and typed arrays with `includes`, and checks `Map` keys and `Set` values with `has`.
- `expectNotContains(container, item, message?)` fails if the item is present in those containers.
- `expectLength(actual, expected, message?)`, `expectLengthBetween(actual, minimum, maximum, message?)`, `expectEmpty(actual, message?)` and `expectNotEmpty(actual, message?)` check array, string, map, set, and typed-array sizes. Length bounds are inclusive.
- `expectStartsWith(actual, prefix, message?)` and `expectEndsWith(actual, suffix, message?)` check string prefixes and suffixes; `expectNotStartsWith` and `expectNotEndsWith` assert their absence.
- `expectMatches(actual, pattern, message?)` and `expectNotMatches(actual, pattern, message?)` search using a `RegExp` or pattern string. A match anywhere in the string is enough.
- `expectErrorMessage(error, substring, message?)` checks the error message (or string representation for non-Error values).
- `expectThrows(callback, ErrorClassOrPredicate?, message?) checks a synchronous callback for an exception.
- `fail(message?)` explicitly fails the current case.
- `runTests(cases, { filter?, tag?, failFast?, beforeEach?, afterEach? })` runs cases sequentially, prints a summary, and returns `0` or `1`. Filters ignore case; tag matching is exact. Hooks may be asynchronous.

This implementation is Node.js-specific because it uses Node's value inspection and deep equality utilities. Discovery and browser support are not implemented yet.
