import { isDeepStrictEqual, inspect } from 'node:util';

/** Declare a named test case. The callback may be synchronous or async. */
export function test(name, fn, { tags = [], skipReason } = {}) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new TypeError('test name must be a nonempty string');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('test callback must be a function');
  }
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
    throw new TypeError('tags must be an array of nonempty strings');
  }
  if (skipReason !== undefined && (typeof skipReason !== 'string' || !skipReason.trim())) {
    throw new TypeError('skipReason must be a nonempty string when provided');
  }
  return Object.freeze({ name: name.trim(), fn, tags: Object.freeze([...new Set(tags.map((tag) => tag.trim()))]), skipReason });
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

/** Fail unless actual and unexpected differ. */
export function expectNotEqual(actual, unexpected, message = 'Values are unexpectedly equal') {
  if (isDeepStrictEqual(actual, unexpected)) {
    throw new ExpectationFailure(message, { actual, expected: `a value different from ${inspect(unexpected)}` });
  }
}

/** Fail unless container includes item (using its native includes method). */
export function expectContains(container, item, message = 'Item is not present in the container') {
  if (container == null || typeof container.includes !== 'function') {
    throw new TypeError('container must provide an includes(value) method');
  }
  if (!container.includes(item)) {
    throw new ExpectationFailure(message, { actual: container, expected: `a container containing ${inspect(item)}` });
  }
}

/** Fail unless callback throws an error matching expected (an Error class or predicate). */
export function expectThrows(callback, expected = Error, message) {
  if (typeof callback !== 'function') throw new TypeError('callback must be a function');
  if (typeof expected !== 'function') throw new TypeError('expected must be an Error class or predicate');
  let thrown;
  let didThrow = false;
  try {
    callback();
  } catch (error) {
    thrown = error;
    didThrow = true;
  }
  const matches = didThrow && (
    typeof expected === 'function' && (expected.prototype instanceof Error || expected === Error)
      ? thrown instanceof expected
      : typeof expected === 'function' && expected(thrown)
  );
  if (!matches) {
    throw new ExpectationFailure(message ?? `Expected ${expected.name ?? 'matching error'} to be thrown`, {
      actual: didThrow ? thrown : 'no exception', expected: expected.name || 'matching error',
    });
  }
  return thrown;
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
export async function runTests(cases, { filter, tag, failFast = false, beforeEach, afterEach } = {}) {
  if (!Array.isArray(cases)) throw new TypeError('cases must be an array');
  const selected = cases.filter((item) => {
    if (!item || typeof item.name !== 'string' || typeof item.fn !== 'function') {
      throw new TypeError('each case must be created with test(name, callback)');
    }
    return (filter === undefined || item.name.toLocaleLowerCase().includes(String(filter).toLocaleLowerCase()))
      && (tag === undefined || item.tags.some((value) => value.toLocaleLowerCase() === String(tag).toLocaleLowerCase()));
  });

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let processed = 0;
  for (const item of selected) {
    processed += 1;
    if (item.skipReason !== undefined) {
      console.log(`SKIP  ${item.name} (${item.skipReason})`);
      skipped += 1;
      continue;
    }
    let setupSucceeded = false;
    let phase = 'beforeEach';
    try {
      if (beforeEach) await beforeEach();
      setupSucceeded = true;
      phase = 'test';
      await item.fn();
      phase = 'afterEach';
      if (afterEach) await afterEach();
      console.log(`PASS  ${item.name}`);
      passed += 1;
    } catch (error) {
      failed += 1;
      console.log(`FAIL  ${item.name}${phase === 'test' ? '' : ` (${phase})`}`);
      console.log(`      ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`);
      if (error instanceof ExpectationFailure && error.values) {
        console.log(`      Expected: ${inspect(error.values.expected)}`);
        console.log(`      Actual:   ${inspect(error.values.actual)}`);
      }
      const location = error instanceof Error
        ? error.stack?.split('\n').find((line) => line.includes('.js:') && !line.includes('/src/index.js'))
        : undefined;
      if (location) console.log(`      ${location.trim().replace(/^at\s+/, '')}`);
      if (setupSucceeded && phase !== 'afterEach' && afterEach) {
        try {
          await afterEach();
        } catch (teardownError) {
          failed += 1;
          console.log(`FAIL  ${item.name} (afterEach)`);
          console.log(`      ${teardownError instanceof Error ? `${teardownError.name}: ${teardownError.message}` : String(teardownError)}`);
        }
      }
      if (failFast) break;
    }
  }

  console.log(`\n${processed} processed: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  if (selected.length === 0) {
    if (filter !== undefined && tag !== undefined) console.log(`No test cases matched name ${String(filter)} and tag ${String(tag)}`);
    else if (filter !== undefined) console.log(`No test cases matched name ${String(filter)}`);
    else if (tag !== undefined) console.log(`No test cases matched tag ${String(tag)}`);
    else console.log('No test cases were found');
    return 1;
  }
  return failed === 0 ? 0 : 1;
}
