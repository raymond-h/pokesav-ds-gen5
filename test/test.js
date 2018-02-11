import test from 'ava';

import path from 'path';
import fse from 'fs-extra';

import { fromBuffer } from '../lib/index';
import { asDate } from '../lib/util';

test.beforeEach(async t => {
  const savefile = await fse.readFile(
    path.join(__dirname, '../testdata/diamond.sav'),
    { encoding: null }
  );

  t.context.data = fromBuffer(savefile);

  t.context.currentGeneralBlock = t.context.data.generalBlockCurrent;
});

test('adventure started', t => {
  const { adventureStartTime } = t.context.data.generalBlockCurrent;
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

  const expected = [
    {
      ivHp: 24,
      ivAttack: 25,
      ivDefense: 16,
      ivSpeed: 6,
      ivSpecialAttack: 27,
      ivSpecialDefense: 2
    },
    {
      ivHp: 28,
      ivAttack: 2,
      ivDefense: 13,
      ivSpeed: 11,
      ivSpecialAttack: 31,
      ivSpecialDefense: 15
    }
  ];

  const actual = party.map(pkmn => pkmn.base).map(pkmn => ({
    ivHp: pkmn.data.blockB.iv.hp,
    ivAttack: pkmn.data.blockB.iv.attack,
    ivDefense: pkmn.data.blockB.iv.defense,
    ivSpeed: pkmn.data.blockB.iv.speed,
    ivSpecialAttack: pkmn.data.blockB.iv.specialAttack,
    ivSpecialDefense: pkmn.data.blockB.iv.specialDefense
  }));

  t.deepEqual(actual, expected, 'expected IVs to be correct');
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

  t.deepEqual(levels, [6, 4]);
});

test('correct party hp', t => {
  const hps = t.context.currentGeneralBlock.partyPokemon
    .map(pkmn => ({
      current: pkmn.battleStats.currentHp,
      max: pkmn.battleStats.stats.hp
    }));

  t.snapshot(hps);
});
