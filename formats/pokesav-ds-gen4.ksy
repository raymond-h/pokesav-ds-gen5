meta:
  id: pokesav_ds_gen4
  endian: le
  file-extension: sav
  application: 'Pokémon Diamond/Pearl/Platinum/HeartGold/SoulSilver Version'

instances:
  diamond_pearl_first_general_block_size:
    pos: 0x40000 + 49408 - 20 + 0x08
    type: u4
  diamond_pearl_first_storage_block_size:
    pos: 0x4C100 + 74208 - 20 + 0x08
    type: u4

  is_diamond_pearl:
    value: diamond_pearl_first_general_block_size == 49408 and diamond_pearl_first_storage_block_size == 74208

  platinum_first_general_block_size:
    pos: 0x40000 + 53036 - 20 + 0x08
    type: u4
  platinum_first_storage_block_size:
    pos: 0x4CF2C + 74212 - 20 + 0x08
    type: u4

  is_platinum:
    value: platinum_first_general_block_size == 53036 and platinum_first_storage_block_size == 74212

  hgss_first_general_block_size:
    pos: 0x40000 + 63016 - 20 + 0x08
    type: u4
  hgss_first_storage_block_size:
    pos: 0x4F700 + 74512 - 20 + 0x08
    type: u4

  is_hgss:
    value: hgss_first_general_block_size == 63016 and hgss_first_storage_block_size == 74512

  game:
    value: >
      is_diamond_pearl ? game::diamond_pearl : (
        is_platinum ? game::platinum : (
          is_hgss ? game::heart_gold_soul_silver : game::unknown
        )
      )
    enum: game

  general_block_offset:
    value: '0x00000'

  general_block_size:
    value: 'is_platinum ? 53036 : (is_hgss ? 63016 : 49408)'

  storage_block_offset:
    value: 'is_platinum ? 0x0CF2C : (is_hgss ? 0x0F700 : 0x0C100)'

  storage_block_size:
    value: 'is_platinum ? 74212 : (is_hgss ? 74512 : 74208)'

  general_block_1:
    pos: 'general_block_offset'
    size: 'general_block_size'
    type: general_block
  storage_block_1:
    pos: 'storage_block_offset'
    size: 'storage_block_size'
    type: storage_block

  general_block_2:
    pos: '0x40000 + general_block_offset'
    size: 'general_block_size'
    type: general_block
  storage_block_2:
    pos: '0x40000 + storage_block_offset'
    size: 'storage_block_size'
    type: storage_block

  has_backup:
    value: general_block_1.footer.general_block_save_count != 0xFFFFFFFF

  general_block_current:
    value: >
      (has_backup and (general_block_1.footer.general_block_save_count > general_block_2.footer.general_block_save_count))
        ? general_block_1
        : general_block_2
  general_block_backup:
    value: >
      (has_backup and (general_block_1.footer.general_block_save_count > general_block_2.footer.general_block_save_count))
        ? general_block_2
        : general_block_1

  storage_block_current:
    value: >
      (has_backup and (storage_block_1.footer.storage_block_save_count == general_block_current.footer.storage_block_save_count))
        ? storage_block_1
        : storage_block_2
  storage_block_backup:
    value: >
      (has_backup and (storage_block_1.footer.storage_block_save_count == general_block_current.footer.storage_block_save_count))
        ? storage_block_2
        : storage_block_1
enums:
  game:
    0: unknown
    8: heart_gold_soul_silver
    10: diamond_pearl
    12: platinum

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
  general_block:
    seq:
      - id: junk
        size: _parent.general_block_size - 20
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
        pos: '_parent.is_platinum ? 0x68 : 0x64'
        size: 2*8
        process: pokesav.string_decode
      trainer_id:
        pos: '_parent.is_platinum ? 0x78 : 0x74'
        type: u2
      secret_id:
        pos: '_parent.is_platinum ? 0x7A : 0x76'
        type: u2
      money:
        pos: '_parent.is_platinum ? 0x7C : 0x78'
        type: u4
      trainer_gender:
        pos: '_parent.is_platinum ? 0x80 : 0x7C'
        type: u1
        enum: trainer_gender
      country_of_origin:
        pos: '_parent.is_platinum ? 0x81 : 0x7D'
        type: u1
        enum: country_of_origin
      badge_flags:
        pos: '_parent.is_platinum ? 0x82 : 0x7E'
        type: u1
      multiplayer_avatar:
        pos: '_parent.is_platinum ? 0x83 : 0x7F'
        type: u1
        enum: multiplayer_avatar
      playtime:
        pos: '_parent.is_platinum ? 0x8A : 0x86'
        type: playtime
      total_playtime_seconds:
        value: playtime.hours * 60 * 60 + playtime.minutes * 60 + playtime.seconds
      party_pokemon_count:
        pos: '_parent.is_platinum ? 0x9C : 0x94'
        type: u1
      party_pokemon:
        pos: '_parent.is_platinum ? 0xA0 : 0x98'
        type: pokemon_in_party
        repeat: expr
        repeat-expr: party_pokemon_count
      trainer_card_signature:
        pos: '_parent.is_platinum ? 0x5BA8 : (_parent.is_hgss ? 0x4538 : 0x5904)'
        size: 1536
        process: pokesav.trainer_card_signature_reorder(192 / 8)

  playtime:
    seq:
      - id: hours
        type: u2
      - id: minutes
        type: u1
      - id: seconds
        type: u1

  pokemon_in_party:
    seq:
      - id: base
        type: pokemon
      - id: battle_stats
        type: pokemon_battle_stats
        size: 100
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

      nature:
        value: personality_value % 25
        enum: nature

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
      - id: unknown_2
        size: 0x38
      - id: seal_coordinates
        size: 0x18

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

  storage_block:
    seq:
      - id: tmp_junk
        size: _parent.storage_block_size - 20
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
