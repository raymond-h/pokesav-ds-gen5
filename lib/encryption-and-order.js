import { ok, deepEqual } from 'assert';

function decryptBuffer(buf, key) {
  ok(buf.length % 2 === 0, 'expected buffer length to be a multiple of 2');

  const decryptedBuf = Buffer.allocUnsafe(buf.length);

  let last = key >>> 0;
  for (let i = 0; i < buf.length; i += 2) {
    const tmp = Math.imul(0x41C64E6D, last);
    const next = (tmp + 0x6073) & 0xFFFFFFFF;
    last = next;

    const genKey = (next >> 16) & 0xFFFF;

    const decryptedValue = (buf.readUInt16LE(i) ^ genKey) & 0xFFFF;

    decryptedBuf.writeUInt16LE(decryptedValue, i);
  }

  return decryptedBuf;
}

const encryptBuffer = decryptBuffer;

function shuffleBlocks(buf, order) {
  ok(buf.length % 4 === 0, 'expected buffer length to be a multiple of 4');
  deepEqual(
    order.toLowerCase().split('').sort(),
    'abcd'.split(''),
    'expected order to contain only the letters a, b, c and d'
  );

  const blockSize = buf.length / 4;

  const orderIdx = order.toLowerCase().split('')
    .map(blockLetter => blockLetter.codePointAt(0) - 'a'.codePointAt(0));

  for (let i = 0; i < orderIdx; i++) {
    ok([0, 1, 2, 3].includes(orderIdx), `expected order index ${i} to be one of 0, 1, 2, 3`);
  }

  return Buffer.concat(
    orderIdx
      .map(i => buf.slice(i * blockSize, (i + 1) * blockSize))
  );
}

const PokemonInverseBlockOrder = /* #__PURE__ */Object.freeze({
  0: 'ABCD',
  1: 'ABDC',
  2: 'ACBD',
  3: 'ADBC',
  4: 'ACDB',
  5: 'ADCB',
  6: 'BACD',
  7: 'BADC',
  8: 'CABD',
  9: 'DABC',
  10: 'CADB',
  11: 'DACB',
  12: 'BCAD',
  13: 'BDAC',
  14: 'CBAD',
  15: 'DBAC',
  16: 'CDAB',
  17: 'DCAB',
  18: 'BCDA',
  19: 'BDCA',
  20: 'CBDA',
  21: 'DBCA',
  22: 'CDBA',
  23: 'DCBA',
});

function decryptPokemonBuffer(buf, orderNum, key) {
  const decryptedBuf = decryptBuffer(buf, key);
  return shuffleBlocks(
    decryptedBuf,
    (typeof orderNum === 'number') ?
      PokemonInverseBlockOrder[orderNum] :
      orderNum
  );
}

function decryptPokemon(data) {
  return decryptPokemonBuffer(
    Buffer.from(data.encryptedData),
    data.blockOrder,
    data.checksum
  );
}

export { encryptBuffer, decryptBuffer, shuffleBlocks, decryptPokemonBuffer, decryptPokemon };
