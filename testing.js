import fse from 'fs-extra';
import { PokesavDsGen5, fromBuffer, util } from './lib/index.js';

function leftPad(str, padding, width) {
  while (str.length < width) {
    str = padding + str;
  }
  return str.slice(-width);
}

async function main() {
  // const file = './testdata/diamond.sav'
  // const file = './testdata/platinum-first-save.sav'
  // const file = './testdata/platinum-piplup-get.sav'
  // const file = './testdata/soulsilver-first-save.sav'
  // const file = './testdata/soulsilver-cyndaquil-get.sav'
  // const file = './testdata/black-first-save.sav'
  // const file = './testdata/white-2-first-save.sav'
  const file = './testdata/black-oshawott-get.sav';

  const buf = await fse.readFile(file, { encoding: null });

  console.log(`Reading ${file}`);
  const data = fromBuffer(buf);

  console.log({
    isBlackWhite: data.isBlackWhite,
    isBlack2White2: data.isBlack2White2,
    game: PokesavDsGen5.Game[data.game]
  });

  const trainerData = data.trainerDataBlock;
  const partyPokemonData = data.partyPokemonBlock;
  const cardSignatureBadgeBlock = data.cardSignatureBadgeBlock;

  console.log('Name', trainerData.trainerName);
  console.log(`Started adventure at ${util.asDate(data.adventureDataBlock.adventureStartTime)}, has ${partyPokemonData.partyPokemon.length} Pokemon in party.`);
  console.log('Playtime:', data.trainerDataBlock.playtime);
  console.log('Party:');
  for (const pkmn of partyPokemonData.partyPokemon) {
    console.log('- Nickname:', pkmn.base.blockC.nickname);
    console.log('  Personality value:', leftPad(pkmn.base.personalityValue.toString(16), '0', 2 * 4));
    // console.log('  Personality value:', pkmn.base.personalityValue);
    console.log('  OT name:', pkmn.base.blockD.originalTrainerName);
    console.log('  Origin game:', '0b' + pkmn.base.blockC.originGame.toString(2).padStart(8, '0'), `(${pkmn.base.blockC.originGame}, ${PokesavDsGen5.Game[pkmn.base.blockC.originGame]})`);
  }

  await fse.writeFile('signature.rgb', cardSignatureBadgeBlock.trainerCardSignature);
  console.log('Wrote signature to signature.rgb');
  // console.log(`Started adventure at ${util.asDate(second.adventureStartTime)}, has ${second.partyPokemon.length} Pokemon in party. Checksum: ${second.footer.checksum.toString(16)}`);
}

main().catch(err => console.error(err.stack));
