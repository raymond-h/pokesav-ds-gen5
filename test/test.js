import test from 'ava';

import path from 'path';
import fse from 'fs-extra';

import { PokesavDsGen5, fromBuffer } from '../lib/index';
import { asDate } from '../lib/util';

async function detectMacro(t, filePath, game) {
  const savefile = await fse.readFile(
    path.join(__dirname, filePath),
    { encoding: null }
  );

  const data = fromBuffer(savefile);

  t.is(PokesavDsGen5.Game[data.game], PokesavDsGen5.Game[game]);
}

test('detects black (first save)', detectMacro, '../testdata/black-oshawott-get.sav', PokesavDsGen5.Game.BLACK_WHITE);
test('detects white 2 (first save)', detectMacro, '../testdata/white-2-snivy-get.sav', PokesavDsGen5.Game.BLACK_2_WHITE_2);

test.beforeEach(async t => {
  const savefile = await fse.readFile(
    path.join(__dirname, '../testdata/black-oshawott-get.sav'),
    { encoding: null }
  );

  t.context.data = fromBuffer(savefile);
});

test('adventure started', t => {
  const { adventureStartTime } = t.context.data.adventureDataBlock;
  const startDate = asDate(adventureStartTime);

  t.is(startDate.getFullYear(), 2022);
});

test('all pokemon in party belong to this savefile', t => {
  const { trainerId, secretId } = t.context.data.trainerDataBlock;

  let i = 0;
  for(const { data } of t.context.data.partyPokemonBlock.partyPokemon.map(pkmn => pkmn.base)) {
    const originalTrainerId = data.blockA.originalTrainerId;
    const originalTrainerSecretId = data.blockA.originalTrainerSecretId;

    t.is(originalTrainerId, trainerId, `expected pokemon #${++i}'s trainer ID to match savefile's trainer ID`);
    t.is(originalTrainerSecretId, secretId, `expected pokemon #${i}'s secret ID to match savefile's secret ID`);
  }
});

test('correct ivs and isEgg, isNicknamed flags', t => {
  const party = t.context.data.partyPokemonBlock.partyPokemon;

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
  const firstMon = t.context.data.partyPokemonBlock.partyPokemon[0];
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
  const levels = t.context.data.partyPokemonBlock.partyPokemon.map(pkmn => pkmn.battleStats.level);

  t.deepEqual(levels, [6, 3, 3, 2]);
});

test('correct party hp', t => {
  const hps = t.context.data.partyPokemonBlock.partyPokemon
    .map(pkmn => ({
      current: pkmn.battleStats.currentHp,
      max: pkmn.battleStats.stats.hp
    }));

  t.snapshot(hps);
});