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

  pokemon_data:
    seq:
      - id: block_a
        type: pokemon_block_a
      - id: block_b
        type: pokemon_block_b
      - id: block_c
        type: pokemon_block_c
      - id: block_d
        type: pokemon_block_d

  pokemon_block_a:
    seq:
      - id: national_pokedex_id
        type: u2
      - id: junk
        size: 30

    instances:
      original_trainer_id:
        pos: 0x0C - 8
        type: u2

      original_trainer_secret_id:
        pos: 0x0E - 8
        type: u2

  pokemon_block_b:
    seq:
      - id: junk
        size: 32

  pokemon_block_c:
    seq:
      - id: junk
        size: 32

  pokemon_block_d:
    seq:
      - id: junk
        size: 32

  encrypted_pokemon_in_party:
    seq:
      - id: base
        type: encrypted_pokemon
      - id: rest
        size: 100

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
