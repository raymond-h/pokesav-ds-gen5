import test from 'ava';

import path from 'path';
import fse from 'fs-extra';

import { PokesavDsGen5, fromBuffer } from '../lib/index.js';
import { asDate } from '../lib/util.js';

import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

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
  for (const { data } of t.context.data.partyPokemonBlock.partyPokemon.map(pkmn => pkmn.base)) {
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

function flagListToIndexList(flagList) {
  let index = 0;
  const indices = [];
  for (const isTrue of flagList) {
    if (isTrue) {
      indices.push(index);
    }
    index++;
  }
  return indices;
}

const pokedexSpeciesFlagsMacro = (t, flagGroup) => {
  const pokedexData = t.context.data.pokedexBlock;

  t.snapshot(
    flagListToIndexList(pokedexData.species[flagGroup].species)
      .map(index => index + 1) // +1 because bitflag index = species ID - 1
  );
};

const speciesFlagGroups = [
  'caught',
  'seenMaleGenderless',
  'seenFemale',
  'seenMaleGenderlessShiny',
  'seenFemaleShiny',
  'displayMaleGenderless',
  'displayFemale',
  'displayMaleGenderlessShiny',
  'displayFemaleShiny',
];

for (const flagGroup of speciesFlagGroups) {
  test(`pokedex species flags: ${flagGroup}`, pokedexSpeciesFlagsMacro, flagGroup);
}

const pokedexFormFlagsMacro = (t, flagGroup) => {
  const pokedexData = t.context.data.pokedexBlock;

  const subkeys = Object.keys(pokedexData.forms[flagGroup]).filter(k => !k.startsWith('_'));

  const formLists = {};
  for (const subkey of subkeys) {
    formLists[subkey] = flagListToIndexList(pokedexData.forms[flagGroup][subkey]);
  }
  t.snapshot(formLists);
};

const formFlagGroups = [
  'seen',
  'seenShiny',
  'display',
  'displayShiny',
];

for (const flagGroup of formFlagGroups) {
  test(`pokedex form flags: ${flagGroup}`, pokedexFormFlagsMacro, flagGroup);
}

const pokedexLanguageFlagsMacro = (t, language) => {
  const pokedexData = t.context.data.pokedexBlock;

  t.snapshot(
    flagListToIndexList(pokedexData.languages.species.map(s => s[language]))
      .map(index => index + 1) // +1 because bitflag index = species ID - 1
  );
};

const languages = [
  'japanese',
  'english',
  'french',
  'italian',
  'german',
  'spanish',
  'korean',
];

for (const language of languages) {
  test(`pokedex language flags: ${language}`, pokedexLanguageFlagsMacro, language);
}
