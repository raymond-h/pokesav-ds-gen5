const assert = require('assert');

function decryptBuffer(buf, key) {
  assert.ok(buf.length % 2 === 0, 'expected buffer length to be a multiple of 2');

  const decryptedBuf = Buffer.allocUnsafe(buf.length);

  let last = key >>> 0;
  for(let i = 0; i < buf.length; i+=2) {
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
  assert.ok(buf.length % 4 === 0, 'expected buffer length to be a multiple of 4');
  assert.deepEqual(
    order.toLowerCase().split('').sort(),
    'abcd'.split(''),
    'expected order to contain only the letters a, b, c and d'
  );

  const blockSize = buf.length / 4;

  const orderIdx = order.toLowerCase().split('')
    .map(blockLetter => blockLetter.codePointAt(0) - 'a'.codePointAt(0));

  for(let i = 0; i < orderIdx; i++) {
    assert.ok([0, 1, 2, 3].includes(orderIdx), `expected order index ${i} to be one of 0, 1, 2, 3`);
  }

  return Buffer.concat(
    orderIdx
      .map(i => buf.slice(i * blockSize, (i+1) * blockSize))
  );
}

function decryptPokemonBuffer(buf, orderNum, key) {
  const decryptedBuf = decryptBuffer(buf, key);
  return shuffleBlocks(
    decryptedBuf,
    (typeof orderNum === 'number') ?
      require('../formats-compiled/PokesavDsGen4').PokemonInverseBlockOrder[orderNum] :
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

module.exports = { encryptBuffer, decryptBuffer, shuffleBlocks, decryptPokemonBuffer, decryptPokemon };
