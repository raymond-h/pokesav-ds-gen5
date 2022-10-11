import { crc16ccitt } from 'crc';

const blocks = [
  { pos: 0x0, size: 0x3E0 },
  { pos: 0x400, size: 0xFF0 },
  { pos: 0x1400, size: 0xFF0 },
  { pos: 0x2400, size: 0xFF0 },
  { pos: 0x3400, size: 0xFF0 },
  { pos: 0x4400, size: 0xFF0 },
  { pos: 0x5400, size: 0xFF0 },
  { pos: 0x6400, size: 0xFF0 },
  { pos: 0x7400, size: 0xFF0 },
  { pos: 0x8400, size: 0xFF0 },
  { pos: 0x9400, size: 0xFF0 },
  { pos: 0xA400, size: 0xFF0 },
  { pos: 0xB400, size: 0xFF0 },
  { pos: 0xC400, size: 0xFF0 },
  { pos: 0xD400, size: 0xFF0 },
  { pos: 0xE400, size: 0xFF0 },
  { pos: 0xF400, size: 0xFF0 },
  { pos: 0x10400, size: 0xFF0 },
  { pos: 0x11400, size: 0xFF0 },
  { pos: 0x12400, size: 0xFF0 },
  { pos: 0x13400, size: 0xFF0 },
  { pos: 0x14400, size: 0xFF0 },
  { pos: 0x15400, size: 0xFF0 },
  { pos: 0x16400, size: 0xFF0 },
  { pos: 0x17400, size: 0xFF0 },
  { pos: 0x18E00, size: 0x534 },
];

function isRomChecksumBlocksValid(buf) {
  return !blocks.some((block) => crc16ccitt(buf.subarray(block.pos, block.pos + block.size)) != buf.readUInt16LE(block.pos + block.size + 2));
}

function isSaveGen5(buf) {
  if (buf.size < 0x4C000) {
    return false;
  }
  return isRomChecksumBlocksValid(buf);
}

export { isSaveGen5 };
