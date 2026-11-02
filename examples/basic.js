import { expectAtLeast, expectAtMost, expectContains, expectEmpty, expectEqual, expectErrorMessage, expectGreaterThan, expectLengthBetween, expectLessThan, expectMatches, expectNotBetween, expectNotContains, expectNotEmpty, expectNotMatches, expectNull, expectNotNull, expectThrows, expectTrue, runTests, test } from '../src/index.js';

const cases = [
  test('formats a title', () => {
    expectEqual('hello, puffin'.replace(/\b\w/g, (letter) => letter.toUpperCase()), 'Hello, Puffin');
    expectNull(null);
    expectNotNull('puffin');
    expectEmpty([]);
    expectNotEmpty(['puffin']);
    expectContains(new Map([['puffin', 1]]), 'puffin');
    expectNotContains(new Map([['puffin', 1]]), 'tern');
    expectContains('puffin test', 'test');
    const error = expectThrows(() => { throw new Error('missing puffin'); });
    expectErrorMessage(error, 'puffin');
    expectMatches('order-4821 accepted', /order-\d+ accepted/);
    expectNotMatches('request failed', /\b2xx\b/);
    expectGreaterThan(5, 3);
    expectLessThan(2, 3);
    expectAtLeast(3, 3);
    expectAtMost(3, 3);
    expectNotBetween(4, 1, 3);
  }),
  test('finds the item', () => {
    expectTrue(['puffin', 'tern'].includes('puffin'));
    expectLengthBetween(['puffin', 'tern'], 1, 3);
  }),
];

process.exitCode = await runTests(cases);
