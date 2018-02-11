import test from 'ava';

import path from 'path';
import fse from 'fs-extra';

import { PokesavDsGen4, fromBuffer } from '../lib/index';
import { asDate } from '../lib/util';

async function detectMacro(t, filePath, game) {
  const savefile = await fse.readFile(
    path.join(__dirname, filePath),
    { encoding: null }
  );

  const data = fromBuffer(savefile);

  t.is(PokesavDsGen4.Game[data.game], PokesavDsGen4.Game[game]);
}

test('detects diamond', detectMacro, '../testdata/diamond.sav', PokesavDsGen4.Game.DIAMOND_PEARL);
test('detects platinum (first save)', detectMacro, '../testdata/platinum-first-save.sav', PokesavDsGen4.Game.PLATINUM);
test('detects platinum (after getting Piplup)', detectMacro, '../testdata/platinum-piplup-get.sav', PokesavDsGen4.Game.PLATINUM);
test('detects soul silver (first save)', detectMacro, '../testdata/soulsilver-first-save.sav', PokesavDsGen4.Game.HEART_GOLD_SOUL_SILVER);
test('detects soul silver (after getting Cyndaquil)', detectMacro, '../testdata/soulsilver-cyndaquil-get.sav', PokesavDsGen4.Game.HEART_GOLD_SOUL_SILVER);

test('expect sizes of blocks to match footers in Soul Silver save (first save)', async t => {
  const savefile = await fse.readFile(
    path.join(__dirname, '../testdata/soulsilver-first-save.sav'),
    { encoding: null }
  );

  const data = fromBuffer(savefile);

  t.is(data.hgssFirstGeneralBlockSize, 63016);
  t.is(data.hgssFirstStorageBlockSize, 74512);
});

test.beforeEach(async t => {
  const savefile = await fse.readFile(
    path.join(__dirname, '../testdata/diamond.sav'),
    { encoding: null }
  );

  t.context.data = fromBuffer(savefile);

  t.context.currentGeneralBlock = t.context.data.generalBlockCurrent;
});

test('first and second blocks are not identical', t => {
  const { checksum: checksum1 } = t.context.data.generalBlock1.footer;
  const { checksum: checksum2 } = t.context.data.generalBlock2.footer;

  t.not(checksum1, checksum2);
});

test('adventure started', t => {
  const { adventureStartTime } = t.context.currentGeneralBlock;
  const startDate = asDate(adventureStartTime);

  t.is(startDate.getFullYear(), 2016);
});

test('all pokemon in party belong to this savefile', t => {
  const trainerId = t.context.currentGeneralBlock.trainerId;
  const secretId = t.context.currentGeneralBlock.secretId;

  let i = 0;
  for(const { data } of t.context.currentGeneralBlock.partyPokemon.map(pkmn => pkmn.base)) {
    const originalTrainerId = data.blockA.originalTrainerId;
    const originalTrainerSecretId = data.blockA.originalTrainerSecretId;

    t.is(originalTrainerId, trainerId, `expected pokemon #${++i}'s trainer ID to match savefile's trainer ID`);
    t.is(originalTrainerSecretId, secretId, `expected pokemon #${i}'s secret ID to match savefile's secret ID`);
  }
});

test('correct ivs and isEgg, isNicknamed flags', t => {
  const party = t.context.currentGeneralBlock.partyPokemon;

  const actual = party.map(pkmn => pkmn.base).map(pkmn => ({
    ivHp: pkmn.data.blockB.iv.hp,
    ivAttack: pkmn.data.blockB.iv.attack,
    ivDefense: pkmn.data.blockB.iv.defense,
    ivSpeed: pkmn.data.blockB.iv.speed,
    ivSpecialAttack: pkmn.data.blockB.iv.specialAttack,
    ivSpecialDefense: pkmn.data.blockB.iv.specialDefense
  }));

  t.snapshot(actual, 'expected IVs to be correct');
});

test('correct status flags', t => {
  const firstMon = t.context.currentGeneralBlock.partyPokemon[0];
  const {
    asleepTurnCount, isPoisoned, isBurned, isFrozen, isParalyzed, isToxic
  } = firstMon.battleStats;

  t.is(asleepTurnCount, 0);
  t.false(isPoisoned);
  t.false(isBurned);
  t.false(isFrozen);
  t.false(isParalyzed);
  t.false(isToxic);
});

test('correct level in battle stats', t => {
  const levels = t.context.currentGeneralBlock.partyPokemon.map(pkmn => pkmn.battleStats.level);

  t.deepEqual(levels, [6, 4, 3]);
});

test('correct party hp', t => {
  const hps = t.context.currentGeneralBlock.partyPokemon
    .map(pkmn => ({
      current: pkmn.battleStats.currentHp,
      max: pkmn.battleStats.stats.hp
    }));

  t.snapshot(hps);
});
