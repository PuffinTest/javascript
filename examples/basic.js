import { expectEqual, expectLengthBetween, expectTrue, runTests, test } from '../src/index.js';

const cases = [
  test('formats a title', () => {
    expectEqual('hello, puffin'.replace(/\b\w/g, (letter) => letter.toUpperCase()), 'Hello, Puffin');
  }),
  test('finds the item', () => {
    expectTrue(['puffin', 'tern'].includes('puffin'));
    expectLengthBetween(['puffin', 'tern'], 1, 3);
  }),
];

process.exitCode = await runTests(cases);
