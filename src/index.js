import { isDeepStrictEqual, inspect } from 'node:util';

/** Declare a named test case. The callback may be synchronous or async. */
export function test(name, fn) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new TypeError('test name must be a nonempty string');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('test callback must be a function');
  }
  return Object.freeze({ name: name.trim(), fn });
}

/** Fail unless actual and expected have the same structure and values. */
export function expectEqual(actual, expected, message = 'Values are not equal') {
  if (!isDeepStrictEqual(actual, expected)) {
    throw new ExpectationFailure(message, { actual, expected });
  }
}

/** Fail unless actual is truthy. */
export function expectTrue(actual, message = 'Expected a truthy value') {
  if (!actual) {
    throw new ExpectationFailure(message, { actual, expected: true });
  }
}

/** Fail the current case with an explicit message. */
export function fail(message = 'Explicit failure') {
  throw new ExpectationFailure(message);
}

class ExpectationFailure extends Error {
  constructor(message, values = undefined) {
    super(message);
    this.name = 'ExpectationFailure';
    this.values = values;
  }
}

/** Run cases sequentially, report each result, and return 0 or 1. */
export async function runTests(cases, { filter } = {}) {
  if (!Array.isArray(cases)) throw new TypeError('cases must be an array');
  const selected = cases.filter((item) => {
    if (!item || typeof item.name !== 'string' || typeof item.fn !== 'function') {
      throw new TypeError('each case must be created with test(name, callback)');
    }
    return filter === undefined || item.name.toLocaleLowerCase().includes(String(filter).toLocaleLowerCase());
  });

  let passed = 0;
  let failed = 0;
  for (const item of selected) {
    try {
      await item.fn();
      console.log(`PASS  ${item.name}`);
      passed += 1;
    } catch (error) {
      failed += 1;
      console.log(`FAIL  ${item.name}`);
      console.log(`      ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`);
      if (error instanceof ExpectationFailure && error.values) {
        console.log(`      Expected: ${inspect(error.values.expected)}`);
        console.log(`      Actual:   ${inspect(error.values.actual)}`);
      }
      const location = error instanceof Error
        ? error.stack?.split('\n').find((line) => line.includes('.js:') && !line.includes('/src/index.js'))
        : undefined;
      if (location) console.log(`      ${location.trim().replace(/^at\s+/, '')}`);
    }
  }

  console.log(`\n${selected.length} processed: ${passed} passed, ${failed} failed`);
  if (selected.length === 0) {
    console.log(filter === undefined ? 'No test cases were found' : `No test cases matched ${String(filter)}`);
    return 1;
  }
  return failed === 0 ? 0 : 1;
}
