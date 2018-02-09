const kaitaiStruct = require('kaitai-struct');
const PokesavDppt = require('../formats-compiled/PokesavDppt');

const fse = require('fs-extra');
// const asDate = require('./util').asDate;
const decryptPokemon = require('./encryption-and-order').decryptPokemon;

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

  const party = data.generalBlockCurrent.partyPokemon
    .map(pkmn => {
      const decryptedData = decryptPokemon(pkmn.base);

      return {
        base: pkmn,
        data: new PokesavDppt.PokemonData(
          new kaitaiStruct.KaitaiStream(decryptedData)
        )
      };
    });

  console.log(
    party.map(pkmn => pkmn.data.blockA.nationalPokedexId)
  );
}

main()
  .catch(err => console.error(err.stack));
