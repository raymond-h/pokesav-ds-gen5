import { decryptPokemonBuffer, decryptBuffer } from './encryption-and-order.js';

export const PokemonDecryptShuffle = class PokemonDecryptionAndShuffleProcess {
  constructor(blockOrder, checksum) {
    this.blockOrder = blockOrder;
    this.checksum = checksum;
  }

  decode(data) {
    return decryptPokemonBuffer(
      Buffer.from(data), this.blockOrder, this.checksum
    );
  }
};

export const PokemonDecrypt = class PokemonDecryptionProcess {
  constructor(key) {
    this.key = key;
  }

  decode(data) {
    return decryptBuffer(
      Buffer.from(data), this.key
    );
  }
};

import { decodeString } from './text-encoding.js';

export const StringDecode = class StringDecodeProcess {
  decode(data) {
    const newBuffer = new ArrayBuffer(data.length);
    const uint8 = new Uint8Array(newBuffer);
    uint8.set(data);

    return decodeString(uint8);
  }
};

import { reorderSignaturePixelRows } from './trainer-card-signature.js';

export const TrainerCardSignatureReorder = class TrainerCardSignatureReorderProcess {
  constructor(bytesPerRow) {
    this.bytesPerRow = bytesPerRow || (192 / 8);
  }

  decode(data) {
    const outBuf = Buffer.allocUnsafe(data.length);
    reorderSignaturePixelRows(Buffer.from(data), this.bytesPerRow, outBuf);
    return outBuf;
  }
};
