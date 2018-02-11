const encryption = require('./encryption-and-order');

module.exports.PokemonDecryptShuffle = class PokemonDecryptionAndShuffleProcess {
  constructor(blockOrder, checksum) {
    this.blockOrder = blockOrder;
    this.checksum = checksum;
  }

  decode(data) {
    return encryption.decryptPokemonBuffer(
      Buffer.from(data), this.blockOrder, this.checksum
    );
  }
};

module.exports.PokemonDecrypt = class PokemonDecryptionProcess {
  constructor(key) {
    this.key = key;
  }

  decode(data) {
    return encryption.decryptBuffer(
      Buffer.from(data), this.key
    );
  }
};

const textEncoding = require('./text-encoding');

module.exports.StringDecode = class StringDecodeProcess {
  decode(data) {
    const newBuffer = new ArrayBuffer(data.length);
    const uint8 = new Uint8Array(newBuffer);
    uint8.set(data);

    return textEncoding.decodeString(
      Array.from(new Uint16Array(newBuffer))
    );
  }
};

const trainerCardSignature = require('./trainer-card-signature');

module.exports.TrainerCardSignatureReorder = class TrainerCardSignatureReorderProcess {
  constructor(bytesPerRow) {
    this.bytesPerRow = bytesPerRow || (192 / 8);
  }

  decode(data) {
    const outBuf = Buffer.allocUnsafe(data.length);
    trainerCardSignature.reorderSignaturePixelRows(data, this.bytesPerRow, outBuf);
    return outBuf;
  }
};
