const kaitaiStruct = require('kaitai-struct');
const PokesavDsGen4 = require('../formats-compiled/PokesavDsGen4');

const util = require('./util');

function fromBuffer(buf) {
  return new PokesavDsGen4(
    new kaitaiStruct.KaitaiStream(buf)
  );
}

module.exports = { PokesavDsGen4, fromBuffer, util };
