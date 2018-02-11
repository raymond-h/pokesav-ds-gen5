const fse = require('fs-extra');
const { PokesavDsGen4, fromBuffer, util } = require('./lib');

async function main() {
  // const buf = await fse.readFile('./testdata/diamond.sav', { encoding: null });
  const buf = await fse.readFile('./testdata/platinum-first-save.sav', { encoding: null });
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

  console.log(`Started adventure at ${util.asDate(current.adventureStartTime)}, has ${current.partyPokemon.length} Pokemon in party. Checksum: ${current.footer.checksum.toString(16)}`);
  // console.log(`Started adventure at ${util.asDate(second.adventureStartTime)}, has ${second.partyPokemon.length} Pokemon in party. Checksum: ${second.footer.checksum.toString(16)}`);
}

main().catch(err => console.error(err.stack));
