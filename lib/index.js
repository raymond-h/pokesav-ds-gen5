const kaitaiStruct = require('kaitai-struct');
const PokesavDppt = require('../formats-compiled/PokesavDppt');

const fse = require('fs-extra');
// const asDate = require('./util').asDate;

async function main() {
  const buf = await fse.readFile('./testdata/diamond.sav');

  const data = new PokesavDppt(
    new kaitaiStruct.KaitaiStream(buf)
  );

  // console.log(
  //   PokesavDppt.MultiplayerAvatar[data.generalBlockCurrent.multiplayerAvatar]
  // );

  // console.log(data.generalBlockCurrent.playtime);
  // console.log(data.generalBlockCurrent.totalPlaytimeSeconds);

  console.log(
    data.generalBlockCurrent.partyPokemon
      .map(pkmn => pkmn.base.data)
  );
}

main()
  .catch(err => console.error(err.stack));
