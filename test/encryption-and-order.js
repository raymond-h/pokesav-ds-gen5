import test from 'ava';
import jsv from 'jsverify';
import { inspect } from 'util';

import { encryptBuffer, decryptBuffer, shuffleBlocks } from '../lib/encryption-and-order';
import PokesavDppt from '../formats-compiled/PokesavDppt';

const bufferArb = jsv.array(jsv.uint8)
  .smap(
    Buffer.from,
    Array.from,
    inspect
  );

const evenLengthBufferArb = jsv.suchthat(bufferArb, buf => buf.length % 2 === 0);
const neEvenLengthBufferArb = jsv.suchthat(evenLengthBufferArb, buf => buf.length > 0);

const length4BufferArb = jsv.suchthat(
  jsv.tuple([jsv.uint8, jsv.uint8, jsv.uint8, jsv.uint8]),
  tuple =>
    (tuple[0] !== tuple[1]) && (tuple[0] !== tuple[2]) && (tuple[0] !== tuple[3]) &&
    (tuple[1] !== tuple[2]) && (tuple[1] !== tuple[3]) &&
    (tuple[2] !== tuple[3])
).smap(
  Buffer.from,
  Array.from,
  inspect
);

const nonZeroUInt16Arb = jsv.suchthat(jsv.uint16, n => n !== 0);

const nonDefaultOrderArb = jsv.integer(1, 23)
  .smap(
    n => PokesavDppt.PokemonBlockOrder[n],
    str => PokesavDppt.PokemonBlockOrder[str]
  );

test('decrypt output should not equal input for non-zero key', t => {
  jsv.assertForall(neEvenLengthBufferArb, nonZeroUInt16Arb, (buf, key) =>
    !buf.equals(decryptBuffer(buf, key))
  );

  t.pass();
});

function decryptNotEqualMacro(t, buf, key) {
  t.notDeepEqual(buf, decryptBuffer(buf, key));
}
decryptNotEqualMacro.title = (providedTitle, buf, key) =>
  `${providedTitle} decrypting ${inspect(buf)} with key '${inspect(key)}', output != input`.trim();

test(decryptNotEqualMacro, Buffer.from([0, 0]), 1);
test(decryptNotEqualMacro, Buffer.from([0, 0, 0, 0]), 1);

test('encrypt/decrypt complement property', t => {
  jsv.assertForall(evenLengthBufferArb, 'uint16', (buf, key) =>
    buf.equals(decryptBuffer(encryptBuffer(buf, key), key))
  );

  t.pass();
});

test('shuffle blocks different order property', t => {
  const prop = jsv.forall(length4BufferArb, nonDefaultOrderArb, (buf, order) =>
    !buf.equals(shuffleBlocks(buf, order))
  );

  jsv.assert(prop, { tests: 10000, size: 500 });

  t.pass();
});

test('shuffle blocks (unchanged order)', t => {
  const data = Buffer.from([0x00, 0x11, 0x22, 0x33]);
  t.deepEqual(data, shuffleBlocks(data, 'abcd'));
});

test('shuffle blocks (different order)', t => {
  const data = Buffer.from([0x00, 0x11, 0x22, 0x33]);
  const expected = Buffer.from([0x33, 0x00, 0x22, 0x11]);

  t.deepEqual(expected, shuffleBlocks(data, 'dacb'));
});

test('shuffle blocks (different order, larger blocks)', t => {
  const data = Buffer.from([
    0x00, 0x01, 0x02,
    0x10, 0x11, 0x12,
    0x20, 0x21, 0x22,
    0x30, 0x31, 0x32
  ]);
  const expected = Buffer.from([
    0x30, 0x31, 0x32,
    0x00, 0x01, 0x02,
    0x20, 0x21, 0x22,
    0x10, 0x11, 0x12
  ]);

  t.deepEqual(expected, shuffleBlocks(data, 'dacb'));
});
