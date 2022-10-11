import fse from 'fs-extra';
import _ from 'lodash';
import { PokesavDsGen5, fromBuffer } from './lib/index.js';

function speciesFlagsToList(speciesFlags) {
  let speciesId = 1;
  const trueFlags = [];
  for (const isTrue of speciesFlags) {
    if (isTrue) {
      trueFlags.push(speciesId);
    }
    speciesId++;
  }
  return trueFlags;
}

async function main() {
  // const file = './testdata/diamond.sav'
  // const file = './testdata/platinum-first-save.sav'
  // const file = './testdata/platinum-piplup-get.sav'
  // const file = './testdata/soulsilver-first-save.sav'
  // const file = './testdata/soulsilver-cyndaquil-get.sav'
  // const file = './testdata/black-first-save.sav'
  // const file = './testdata/white-2-first-save.sav'
  const file = './testdata/white-2-snivy-get.sav';
  // const file = './testdata/black-oshawott-get.sav';

  const buf = await fse.readFile(file, { encoding: null });

  console.log(`Reading ${file}`);
  const data = fromBuffer(buf);

  console.log({
    isBlackWhite: data.isBlackWhite,
    isBlack2White2: data.isBlack2White2,
    game: PokesavDsGen5.Game[data.game]
  });

  const pokedexData = data.pokedexBlock;

  const allSeenSpecies = _.union(
    speciesFlagsToList(pokedexData.species.caught.species)
  ).sort((a, b) => a - b);

  for (const species of allSeenSpecies) {
    const seenLanguages = [];
    if (species <= 493) {
      for (const k of ['japanese', 'english', 'french', 'german', 'italian', 'spanish', 'korean']) {
        if (pokedexData.languages.species[species - 1][k]) {
          seenLanguages.push(k);
        }
      }
    }

    console.log(species, seenLanguages);
  }

  console.log('caught:', speciesFlagsToList(pokedexData.species.caught.species));

  console.log('seenMaleGenderless:', speciesFlagsToList(pokedexData.species.seenMaleGenderless.species));
  console.log('seenFemale:', speciesFlagsToList(pokedexData.species.seenFemale.species));
  console.log('seenMaleGenderlessShiny:', speciesFlagsToList(pokedexData.species.seenMaleGenderlessShiny.species));
  console.log('seenFemaleShiny:', speciesFlagsToList(pokedexData.species.seenFemaleShiny.species));

  console.log('displayMaleGenderless:', speciesFlagsToList(pokedexData.species.displayMaleGenderless.species));
  console.log('displayFemale:', speciesFlagsToList(pokedexData.species.displayFemale.species));
  console.log('displayMaleGenderlessShiny:', speciesFlagsToList(pokedexData.species.displayMaleGenderlessShiny.species));
  console.log('displayFemaleShiny:', speciesFlagsToList(pokedexData.species.displayFemaleShiny.species));

  console.log('seen', _.omitBy(pokedexData.forms.seen, (v, k) => k.startsWith('_')));
  console.log('display', _.omitBy(pokedexData.forms.display, (v, k) => k.startsWith('_')));

  console.log(pokedexData.checksum, data.checksumBlock.pokedexChecksum);
}

main().catch(err => console.error(err.stack));
