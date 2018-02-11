const fse = require('fs-extra');
const { PokesavDsGen4, fromBuffer, util } = require('./lib');

async function main() {
  // const buf = await fse.readFile('./testdata/diamond.sav', { encoding: null });
  // const buf = await fse.readFile('./testdata/platinum-first-save.sav', { encoding: null });
  const buf = await fse.readFile('./testdata/platinum-piplup-get.sav', { encoding: null });
  // const buf = await fse.readFile('./testdata/soulsilver-first-save.sav', { encoding: null });
  // const buf = await fse.readFile('./testdata/soulsilver-cyndaquil-get.sav', { encoding: null });
  const data = fromBuffer(buf);

  console.log({
    isDiamondPearl: data.isDiamondPearl,
    isPlatinum: data.isPlatinum,
    isHgss: data.isHgss,
    game: PokesavDsGen4.Game[data.game],
    hasBackup: data.hasBackup
  });

  const current = data.generalBlockCurrent;

  console.log('Name', current.trainerName);
  console.log(`Started adventure at ${util.asDate(current.adventureStartTime)}, has ${current.partyPokemon.length} Pokemon in party. Checksum: ${current.footer.checksum.toString(16)}`);
  console.log('Playtime:', current.playtime);
  console.log('Party:');
  for(const pkmn of current.partyPokemon) {
    console.log('  Nickname:', pkmn.base.blockC.nickname);
    console.log('  OT name:', pkmn.base.blockD.originalTrainerName);
    console.log('  Origin game:', '0b' + pkmn.base.blockC.originGame.toString(2).padStart(8, '0'), `(${pkmn.base.blockC.originGame}, ${PokesavDsGen4.Game[pkmn.base.blockC.originGame]})`);
  }

  await fse.writeFile('signature.rgb', current.trainerCardSignature);
  console.log('Wrote signature to signature.rgb');
  // console.log(`Started adventure at ${util.asDate(second.adventureStartTime)}, has ${second.partyPokemon.length} Pokemon in party. Checksum: ${second.footer.checksum.toString(16)}`);
}

main().catch(err => console.error(err.stack));
