import { expectContains, expectEmpty, expectEqual, expectLengthBetween, expectNotContains, expectNotEmpty, expectNull, expectNotNull, expectTrue, runTests, test } from '../src/index.js';

const cases = [
  test('formats a title', () => {
    expectEqual('hello, puffin'.replace(/\b\w/g, (letter) => letter.toUpperCase()), 'Hello, Puffin');
    expectNull(null);
    expectNotNull('puffin');
    expectEmpty([]);
    expectNotEmpty(['puffin']);
    expectContains(new Map([['puffin', 1]]), 'puffin');
    expectNotContains(new Map([['puffin', 1]]), 'tern');
  }),
  test('finds the item', () => {
    expectTrue(['puffin', 'tern'].includes('puffin'));
    expectLengthBetween(['puffin', 'tern'], 1, 3);
  }),
];

process.exitCode = await runTests(cases);
