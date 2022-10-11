import test from 'ava';

import { reorderSignaturePixelRows } from '../lib/trainer-card-signature.js';

const stringify = (buf, bytesPerRow = 2) => {
  return Array.from(buf)
    .map((n, idx) =>
      n.toString(2).padStart(8, '0') +
        ((idx % bytesPerRow === (bytesPerRow-1)) ? '\n' : '')
    )
    .join('');
};

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
    0b11111111, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b11111111, 0b00000011
  ]);

  t.deepEqual(stringify(reorderSignaturePixelRows(input, 2)), stringify(expected));
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
    0b11111111, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b11111111, 0b00000011
  ]);

  const outBuf = Buffer.allocUnsafe(expected.length);

  reorderSignaturePixelRows(input, 2, outBuf);

  t.deepEqual(stringify(outBuf), stringify(expected));
});

test('reordering rows of pixels should work (larger image)', t => {
  const input = Buffer.from([
    // chunk 1,1
    0b11111111,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b10000001,
    0b11111111,
    // chunk 2,1
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    0b11000000,
    // chunk 1,2
    0b11000000,
    0b10100000,
    0b01010000,
    0b00101000,
    0b00010100,
    0b00001010,
    0b00000101,
    0b00000011,
    // chunk 2,2
    0b00000011,
    0b00000101,
    0b00001010,
    0b00010100,
    0b00101000,
    0b01010000,
    0b10100000,
    0b11000000
  ]);

  const expected = Buffer.from([
    0b11111111, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b10000001, 0b00000011,
    0b11111111, 0b00000011,

    0b00000011, 0b11000000,
    0b00000101, 0b10100000,
    0b00001010, 0b01010000,
    0b00010100, 0b00101000,
    0b00101000, 0b00010100,
    0b01010000, 0b00001010,
    0b10100000, 0b00000101,
    0b11000000, 0b00000011
  ]);

  t.deepEqual(stringify(reorderSignaturePixelRows(input, 2)), stringify(expected));
});
