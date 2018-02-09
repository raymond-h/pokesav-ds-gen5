const encryption = require('./encryption-and-order');

module.exports = class PokemonDecryptionProcess {
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
