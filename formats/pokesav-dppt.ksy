meta:
  id: pokesav_dppt
  endian: le
  file-extension: sav
  application: The Pokemon Company

instances:
  general_block_1:
    pos: 0x00000
    type: general_block
  storage_block_1:
    pos: 0x0C100
    type: storage_block
  general_block_2:
    pos: 0x40000
    type: general_block
  storage_block_2:
    pos: 0x4C100
    type: storage_block

  general_block_current:
    value: 'general_block_1.footer.general_block_save_count > general_block_2.footer.general_block_save_count ? general_block_1 : general_block_2'
  general_block_backup:
    value: 'general_block_1.footer.general_block_save_count > general_block_2.footer.general_block_save_count ? general_block_2 : general_block_1'

  storage_block_current:
    value: 'storage_block_1.footer.storage_block_save_count == general_block_current.footer.storage_block_save_count ? storage_block_1 : storage_block_2'
  storage_block_backup:
    value: 'storage_block_1.footer.storage_block_save_count == general_block_current.footer.storage_block_save_count ? storage_block_2 : storage_block_1'

enums:
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
    0x03: school_kid
    0x05: bug_catcher
    0x06: lass
    0x07: battle_girl
    0x0B: ace_trainer_male
    0x0D: beauty
    0x0E: ace_trainer_female
    0x0F: roughneck
    0x1F: pop_idol
    0x23: social
    0x25: cowgirl
    0x2A: ruin_maniac
    0x32: black_belt
    0x3E: rich_boy
    0x3F: lady
    0x46: psychic

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
  general_block:
    seq:
      - id: junk
        size: 49408 - 20
      - id: footer
        type: general_and_storage_block_footer

    instances:
      adventure_start_time:
        pos: 0x34
        type: u4
      league_champ_time:
        pos: 0x3C
        type: u4
      trainer_name:
        pos: 0x64
        type: u2
        repeat: expr
        repeat-expr: 8
      trainer_id:
        pos: 0x74
        type: u2
      secret_id:
        pos: 0x76
        type: u2
      money:
        pos: 0x78
        type: u4
      trainer_gender:
        pos: 0x7C
        type: u1
        enum: trainer_gender
      country_of_origin:
        pos: 0x7D
        type: u1
        enum: country_of_origin
      badge_flags:
        pos: 0x7E
        type: u1
      multiplayer_avatar:
        pos: 0x7F
        type: u1
        enum: multiplayer_avatar
      playtime:
        pos: 0x86
        type: playtime
      total_playtime_seconds:
        value: playtime.hours * 60 * 60 + playtime.minutes * 60 + playtime.seconds
      party_pokemon_count:
        pos: 0x94
        type: u1
      party_pokemon:
        pos: 0x98
        type: encrypted_pokemon_in_party
        repeat: expr
        repeat-expr: party_pokemon_count

  playtime:
    seq:
      - id: hours
        type: u2
      - id: minutes
        type: u1
      - id: seconds
        type: u1

  encrypted_pokemon:
    seq:
      - id: personality_value
        type: u4
      - id: junk
        size: 2
      - id: checksum
        type: u2
      - id: encrypted_data
        size: 128

    instances:
      block_order:
        value: ((personality_value >> 0xD) & 0x1F) % 24
        enum: pokemon_block_order

  encrypted_pokemon_in_party:
    seq:
      - id: base
        type: encrypted_pokemon
      - id: rest
        size: 100

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
      - id: ev
        type: evs
      - id: contest_values
        size: 6
      - id: sinnoh_ribbons
        size: 4

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
      - id: hoenn_ribbons
        size: 4
      - id: fateful_encounter
        type: b1
      - id: is_female
        type: b1
      - id: is_genderless
        type: b1
      - id: forme
        type: b5
      - id: hgss_shiny_leaves
        type: u1
      - id: unused
        size: 2
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
        type: u2
        repeat: expr
        repeat-expr: 11
      - id: unused
        type: u1
      - id: origin_game
        type: u1
      - id: sinnoh_ribbons
        size: 4
      - id: unused_2
        size: 4

  pokemon_block_d:
    seq:
      - id: original_trainer_name
        type: u2
        repeat: expr
        repeat-expr: 8
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

  storage_block:
    seq:
      - id: tmp_junk
        size: 74208 - 20
      - id: footer
        type: general_and_storage_block_footer

  general_and_storage_block_footer:
    seq:
      - id: storage_block_save_count
        type: u4
      - id: general_block_save_count
        type: u4
      - id: block_size
        type: u4
      - id: runtime_junk
        size: 6
      - id: checksum
        type: u2

  hall_of_hame_footer:
    seq:
      - id: save_id
        type: u4
      - id: save_index
        type: u4
      - id: runtime_junk
        size: 8
      - id: block_size
        type: u4
      - id: runtime_junk_2
        size: 2
      - id: checksum
        type: u2

  test_thing:
    seq:
      - id: first
        type: b10
      - id: second
        type: b6
