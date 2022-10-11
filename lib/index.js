import { KaitaiStream } from 'kaitai-struct';
import PokesavDsGen5 from '../formats-compiled/PokesavDsGen5.js';
import { isSaveGen5 } from './generation-checking.js';

import * as util from './util.js';

function fromBuffer(buf) {
  if (!isSaveGen5(buf)) {
    return null;
  }
  return new PokesavDsGen5(
    new KaitaiStream(buf)
  );
}

export { PokesavDsGen5, fromBuffer, util };
