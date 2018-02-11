import test from 'ava';

import { reorderSignaturePixelRows } from '../lib/trainer-card-signature';

test('reordering rows of pixels should work', t => {
  const input = Buffer.from([
    // chunk 1
    0b11111111,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b11111111,
    // chunk 2
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000
  ]);

  const expected = Buffer.from([
    0b11111111, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b11111111, 0b11000000
  ]);

  t.deepEqual(reorderSignaturePixelRows(input, 2), expected);
});

test('reordering rows of pixels should work (using preallocated buffer)', t => {
  const input = Buffer.from([
    // chunk 1
    0b11111111,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b11111111,
    // chunk 2
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000
  ]);

  const expected = Buffer.from([
    0b11111111, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b10000001, 0b11000000,
    0b11111111, 0b11000000
  ]);

  const outBuf = Buffer.allocUnsafe(expected.length);

  reorderSignaturePixelRows(input, 2, outBuf);

  t.deepEqual(outBuf, expected);
});
