const kaitaiStruct = require('kaitai-struct');
const PokesavDppt = require('../formats-compiled/PokesavDppt');

const util = require('./util');

function fromBuffer(buf) {
  return new PokesavDppt(
    new kaitaiStruct.KaitaiStream(buf)
  );
}

module.exports = { PokesavDppt, fromBuffer, util };
