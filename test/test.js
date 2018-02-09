import test from 'ava';

import path from 'path';
import fse from 'fs-extra';
import kaitaiStruct from 'kaitai-struct';
import PokesavDppt from '../formats-compiled/PokesavDppt';

import { asDate } from '../lib/util';

test.beforeEach(async t => {
  const savefile = await fse.readFile(
    path.join(__dirname, '../testdata/diamond.sav'),
    { encoding: null }
  );

  t.context.data = new PokesavDppt(
    new kaitaiStruct.KaitaiStream(savefile)
  );
});

test('adventure started', t => {
  const { adventureStartTime } = t.context.data.generalBlockCurrent;
  const startDate = asDate(adventureStartTime);

  t.is(startDate.getFullYear(), 2016);
});
