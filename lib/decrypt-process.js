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
