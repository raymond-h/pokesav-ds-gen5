meta:
  id: pokesav_ds_gen5
  endian: le
  file-extension: sav
  application: 'Pokémon Black/White/Black 2/White 2 Version'

instances:
  black_white_checksum_block:
    pos: 0x23F00
    size: 0x8C
    type: checksum_block

  black_2_white_2_checksum_block:
    pos: 0x25F00
    size: 0x93
    type: checksum_block

  is_black_white:
    value: party_pokemon_block.checksum == black_white_checksum_block.party_pokemon_checksum

  is_black_2_white_2:
    value: party_pokemon_block.checksum == black_2_white_2_checksum_block.party_pokemon_checksum

  checksum_block:
    value: 'is_black_2_white_2 ? black_2_white_2_checksum_block : black_white_checksum_block'

  game:
    value: >
      is_black_white ? game::black_white : (
        is_black_2_white_2 ? game::black_2_white_2 : game::unknown
      )

    enum: game

  party_pokemon_block:
    pos: 0x18E00
    size: 0x538
    type: party_pokemon_block

  trainer_data_block:
    pos: 0x19400
    size: 'is_black_2_white_2 ? 0xB4 : 0x6C'
    type: trainer_data_block

  card_signature_badge_block:
    pos: 0x1C100
    size: 0x65C
    type: card_signature_badge_block

  adventure_data_block:
    pos: 0x1D900
    size: 0x5C
    type: adventure_data_block

  extra_trainer_data_block:
    pos: 'is_black_2_white_2 ? 0x21100 : 0x21200'
    size: 0xEC
    type: extra_trainer_data_block

  pokedex_block:
    pos: 'is_black_2_white_2 ? 0x21400 : 0x21600'
    size: 'is_black_2_white_2 ? 0x04E0 : 0x4D8'
    type: pokedex_block

enums:
  game:
    0: unknown
    8: heart_gold_soul_silver
    10: diamond_pearl
    12: platinum
    20: black_white
    22: black_2_white_2

  trainer_gender:
    0: male
    1: female

  country_of_origin:
    0x1: japanese
    0x2: english
    0x3: french
    0x4: italian
    0x5: german
    0x7: spanish
    0x8: korean

  multiplayer_avatar:
    0x00: none
    0x01: ace_trainer_male
    0x02: pkmn_ranger_male
    0x03: pkmn_breeder_male
    0x04: scientist_male
    0x05: hiker
    0x06: roughneck
    0x07: preschooler_male
    0x08: lass
    0x09: ace_trainer_female
    0x0A: pkmn_ranger_female
    0x0B: pkmn_breeder_female
    0x0C: scientist_female
    0x0D: parasol_lady
    0x0E: nurse
    0x0F: preschooler_female

  pokemon_block_order:
    0: abcd
    1: abdc
    2: acbd
    3: acdb
    4: adbc
    5: adcb
    6: bacd
    7: badc
    8: bcad
    9: bcda
    10: bdac
    11: bdca
    12: cabd
    13: cadb
    14: cbad
    15: cbda
    16: cdab
    17: cdba
    18: dabc
    19: dacb
    20: dbac
    21: dbca
    22: dcab
    23: dcba

  pokemon_inverse_block_order:
    0: abcd
    1: abdc
    2: acbd
    3: adbc
    4: acdb
    5: adcb
    6: bacd
    7: badc
    8: cabd
    9: dabc
    10: cadb
    11: dacb
    12: bcad
    13: bdac
    14: cbad
    15: dbac
    16: cdab
    17: dcab
    18: bcda
    19: bdca
    20: cbda
    21: dbca
    22: cdba
    23: dcba

  nature:
    0:  hardy
    1:  lonely
    2:  brave
    3:  adamant
    4:  naughty
    5:  bold
    6:  docile
    7:  relaxed
    8:  impish
    9:  lax
    10: timid
    11: hasty
    12: serious
    13: jolly
    14: naive
    15: modest
    16: mild
    17: quiet
    18: bashful
    19: rash
    20: calm
    21: gentle
    22: sassy
    23: careful
    24: quirky

  pokeball:
    0x01: master_ball
    0x02: ultra_ball
    0x03: great_ball
    0x04: poke_ball
    0x05: safari_ball
    0x06: net_ball
    0x07: dive_ball
    0x08: nest_ball
    0x09: repeat_ball
    0x0A: timer_ball
    0x0B: luxury_ball
    0x0C: premier_ball
    0x0D: dusk_ball
    0x0E: heal_ball
    0x0F: quick_ball
    0x10: cherish_ball

  hgss_pokeball:
    0xEC: fast_ball
    0xED: level_ball
    0xEE: lure_ball
    0xEF: heavy_ball
    0xF0: love_ball
    0xF1: friend_ball
    0xF2: moon_ball
    0xF3: competition_ball
    0xF4: park_ball


types:
  trainer_data_block:
    seq:
      - id: junk
        size: 4
      - id: trainer_name
        size: 2*8
        process: pokesav.string_decode
      - id: trainer_id
        type: u2
      - id: secret_id
        type: u2
    instances:
      multiplayer_avatar:
        pos: 0x20
        type: u1
        enum: multiplayer_avatar
      trainer_gender:
        pos: 0x21
        type: u1
        enum: trainer_gender
      playtime:
        pos: 0x24
        type: playtime
      total_playtime_seconds:
        value: playtime.hours * 60 * 60 + playtime.minutes * 60 + playtime.seconds
      checksum:
        pos: '_parent.is_black_2_white_2 ? 0xB2 : 0x6A'
        type: u2

  playtime:
    seq:
      - id: hours
        type: u2
      - id: minutes
        type: u1
      - id: seconds
        type: u1

  party_pokemon_block:
    seq:
      - id: junk
        size: 4
      - id: party_pokemon_count
        type: u4
      - id: party_pokemon
        type: pokemon_in_party
        repeat: expr
        repeat-expr: 'party_pokemon_count < 6 ? party_pokemon_count : 6'
    instances:
      checksum:
        pos: 0x536
        type: u2

  checksum_block:
    instances:
      party_pokemon_checksum:
        pos: 0x34
        type: u2
      trainer_data_checksum:
        pos: 0x36
        type: u2
      pokedex_checksum:
        pos: '_root.is_black_2_white_2 ? 0x6C : 0x6E'
        type: u2
      checksum:
        pos: '_root.is_black_2_white_2 ? 0xA2 : 0x9A'
        type: u2

  pokemon_in_party:
    seq:
      - id: base
        type: pokemon
      - id: battle_stats
        type: pokemon_battle_stats
        size: 84
        process: pokesav.pokemon_decrypt(base.personality_value)

  pokemon:
    seq:
      - id: personality_value
        type: u4
      - id: junk
        size: 2
      - id: checksum
        type: u2
      - id: data
        type: pokemon_data
        size: 128
        process: pokesav.pokemon_decrypt_shuffle(block_order, checksum)

    instances:
      block_order:
        value: ((personality_value >> 0xD) & 0x1F) % 24
        enum: pokemon_block_order

      block_a:
        value: data.block_a
      block_b:
        value: data.block_b
      block_c:
        value: data.block_c
      block_d:
        value: data.block_d

      is_shiny:
        value: >
          ((block_a.original_trainer_id ^ block_a.original_trainer_secret_id) ^
            (personality_value & 0xFFFF) ^
            ((personality_value >> 16) & 0xFFFF)) < 8

  pokemon_data:
    seq:
      - id: block_a
        type: pokemon_block_a
        size: 32
      - id: block_b
        type: pokemon_block_b
        size: 32
      - id: block_c
        type: pokemon_block_c
        size: 32
      - id: block_d
        type: pokemon_block_d
        size: 32

  pokemon_block_a:
    seq:
      - id: national_pokedex_id
        type: u2
      - id: held_item
        type: u2
      - id: original_trainer_id
        type: u2
      - id: original_trainer_secret_id
        type: u2
      - id: experience_points
        type: u4
      - id: friendship
        type: u1
      - id: ability
        type: u1
      - id: markings
        type: u1
      - id: original_language
        type: u1
        enum: country_of_origin
      - id: ev
        type: evs
      - id: contest_values
        size: 6
      - id: sinnoh_ribbon_set_1
        type: u2
      - id: sinnoh_ribbon_set_2
        type: u2

  evs:
    seq:
      - id: hp
        type: u1
      - id: attack
        type: u1
      - id: defense
        type: u1
      - id: speed
        type: u1
      - id: special_attack
        type: u1
      - id: special_defense
        type: u1

  pokemon_block_b:
    seq:
      - id: moves
        type: u2
        repeat: expr
        repeat-expr: 4
      - id: move_pps
        type: u1
        repeat: expr
        repeat-expr: 4
      - id: move_pp_ups
        type: u1
        repeat: expr
        repeat-expr: 4
      - id: iv
        type: ivs
      - id: hoenn_ribbon_set_1
        type: u2
      - id: hoenn_ribbon_set_2
        type: u2
      - id: forme
        type: b5
      - id: is_genderless
        type: b1
      - id: is_female
        type: b1
      - id: fateful_encounter
        type: b1
      - id: nature
        type: u1
        enum: nature
      - id: unused
        type: b5
      - id: ns_pokemon
        type: b1
      - id: has_hidden_ability
        type: b1
      - id: unused_2
        type: b1
      - id: unused_3
        size: 1
      - id: platinum_egg_location
        type: u2
      - id: platinum_met_at_location
        type: u2

    instances:
      is_egg:
        value: iv.is_egg
      is_nicknamed:
        value: iv.is_nicknamed

  ivs:
    seq:
      - id: flags
        type: u4

    instances:
      hp:
        value: (flags >> 0) & 0b1_1111
      attack:
        value: (flags >> 5) & 0b1_1111
      defense:
        value: (flags >> 10) & 0b1_1111
      speed:
        value: (flags >> 15) & 0b1_1111
      special_attack:
        value: (flags >> 20) & 0b1_1111
      special_defense:
        value: (flags >> 25) & 0b1_1111

      is_egg:
        value: (flags >> 30) & 1 == 1
      is_nicknamed:
        value: (flags >> 31) & 1 == 1

  pokemon_block_c:
    seq:
      - id: nickname
        size: 2*11
        process: pokesav.string_decode
      - id: unused
        type: u1
      - id: origin_game
        type: u1
        enum: game
      - id: sinnoh_ribbon_set_3
        type: u2
      - id: sinnoh_ribbon_set_4
        type: u2
      - id: unused_2
        size: 4

  pokemon_block_d:
    seq:
      - id: original_trainer_name
        size: 2*8
        process: pokesav.string_decode
      - id: date_egg_received
        size: 3
      - id: date_met
        size: 3
      - id: diamond_pearl_egg_location
        type: u2
      - id: diamond_pearl_met_at_location
        type: u2
      - id: pokerus
        type: u1
      - id: pokeball
        type: u1
        enum: pokeball
      - id: original_trainer_gender
        type: b1
        enum: trainer_gender
      - id: met_at_level
        type: b7
      - id: encounter_type
        type: u1
      - id: hgss_pokeball
        type: u1
        enum: hgss_pokeball
      - id: unused
        type: u1

  pokemon_battle_stats:
    seq:
      - id: asleep_turn_count
        type: b3
      - id: is_poisoned
        type: b1
      - id: is_burned
        type: b1
      - id: is_frozen
        type: b1
      - id: is_paralyzed
        type: b1
      - id: is_toxic
        type: b1
      - id: unknown
        size: 3
      - id: level
        type: u1
      - id: capsule_index
        type: u1
      - id: current_hp
        type: u2
      - id: stats
        type: pokemon_stats
      - id: mail_message
        size: 55
      - id: unused
        size: 8

  pokemon_stats:
    seq:
      - id: hp
        type: u2
      - id: attack
        type: u2
      - id: defense
        type: u2
      - id: speed
        type: u2
      - id: special_attack
        type: u2
      - id: special_defense
        type: u2

  card_signature_badge_block:
    instances:
      trainer_card_signature:
        pos: 0
        size: 1536
        process: pokesav.trainer_card_signature_reorder(192 / 8)
      trainer_nature:
        pos: 0x600
        type: u1
        enum: nature

  adventure_data_block:
    instances:
      adventure_start_time:
        pos: 0x34
        type: u4
      league_champ_time:
        pos: 0x3C
        type: u4

  extra_trainer_data_block:
    seq:
      - id: money
        type: u4
      - id: badge_flags
        type: u1

  pokedex_block:
    seq:
      - id: junk_1
        size: 8
      - id: species
        type: species_bitfield_group
      - id: forms
        type: forms_bitfield_group
      - id: languages
        type: species_language_bitfield
      - id: junk_2
        size: 6
      - id: checksum
        type: u2

    types:
      species_bitfield_group:
        seq:
          - id: caught
            type: species_bitfield
            size: 0x54
          - id: seen_male_genderless
            type: species_bitfield
            size: 0x54
          - id: seen_female
            type: species_bitfield
            size: 0x54
          - id: seen_male_genderless_shiny
            type: species_bitfield
            size: 0x54
          - id: seen_female_shiny
            type: species_bitfield
            size: 0x54
          - id: display_male_genderless
            type: species_bitfield
            size: 0x54
          - id: display_female
            type: species_bitfield
            size: 0x54
          - id: display_male_genderless_shiny
            type: species_bitfield
            size: 0x54
          - id: display_female_shiny
            type: species_bitfield
            size: 0x54

      species_bitfield:
        seq:
          - id: species
            type: b1le
            repeat: eos

      forms_bitfield_group:
        seq:
          - id: seen
            type: forms_bitfield
            size: '_root.is_black_2_white_2 ? 0xB : 0x9'
          - id: seen_shiny
            type: forms_bitfield
            size: '_root.is_black_2_white_2 ? 0xB : 0x9'
          - id: display
            type: forms_bitfield
            size: '_root.is_black_2_white_2 ? 0xB : 0x9'
          - id: display_shiny
            type: forms_bitfield
            size: '_root.is_black_2_white_2 ? 0xB : 0x9'

      forms_bitfield:
        seq:
          - id: unown
            type: b1le
            repeat: expr
            repeat-expr: 28
          - id: deoxys
            type: b1le
            repeat: expr
            repeat-expr: 4
          - id: shaymin
            type: b1le
            repeat: expr
            repeat-expr: 2
          - id: giratina
            type: b1le
            repeat: expr
            repeat-expr: 2
          - id: rotom
            type: b1le
            repeat: expr
            repeat-expr: 6
          - id: shellos
            type: b1le
            repeat: expr
            repeat-expr: 2
          - id: gastrodon
            type: b1le
            repeat: expr
            repeat-expr: 2
          - id: burmy
            type: b1le
            repeat: expr
            repeat-expr: 3
          - id: wormadam
            type: b1le
            repeat: expr
            repeat-expr: 3
          - id: castform
            type: b1le
            repeat: expr
            repeat-expr: 4
          - id: cherrim
            type: b1le
            repeat: expr
            repeat-expr: 2
          - id: deerling
            type: b1le
            repeat: expr
            repeat-expr: 4
          - id: sawsbuck
            type: b1le
            repeat: expr
            repeat-expr: 4
          - id: meloetta
            type: b1le
            repeat: expr
            repeat-expr: 2
          - id: darmanitan
            type: b1le
            repeat: expr
            repeat-expr: 2
          - id: basculin
            type: b1le
            repeat: expr
            repeat-expr: 2

          # B2W2-only forms
          - id: kyurem
            type: b1le
            repeat: expr
            repeat-expr: 3
            if: _root.is_black_2_white_2
          - id: keldeo
            type: b1le
            repeat: expr
            repeat-expr: 2
            if: _root.is_black_2_white_2
          - id: thundurus
            type: b1le
            repeat: expr
            repeat-expr: 2
            if: _root.is_black_2_white_2
          - id: tornadus
            type: b1le
            repeat: expr
            repeat-expr: 2
            if: _root.is_black_2_white_2
          - id: landorus
            type: b1le
            repeat: expr
            repeat-expr: 2
            if: _root.is_black_2_white_2

      species_language_bitfield:
        seq:
          - id: species
            type: language_bitfield
            repeat: expr
            repeat-expr: 493

      language_bitfield:
        seq:
          - id: japanese
            type: b1le
          - id: english
            type: b1le
          - id: french
            type: b1le
          - id: italian
            type: b1le
          - id: german
            type: b1le
          - id: spanish
            type: b1le
          - id: korean
            type: b1le
