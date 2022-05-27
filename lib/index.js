const kaitaiStruct = require('kaitai-struct');
const PokesavDsGen5 = require('../formats-compiled/PokesavDsGen5');
const { isSaveGen5 } = require('./generation-checking');

const util = require('./util');

function fromBuffer(buf) {
  if (!isSaveGen5(buf)) {
    return null;
  }
  return new PokesavDsGen5(
    new kaitaiStruct.KaitaiStream(buf)
  );
}

module.exports = { PokesavDsGen5, fromBuffer, util };
