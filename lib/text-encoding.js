const takeWhile = require('lodash.takewhile');

function addRangeToTable(encTable, startCode, startChar, count) {
  for(let i = 0; i < count; i++) {
    encTable[startCode + i] = String.fromCodePoint(startChar.codePointAt(0) + i);
  }
}

const encodingTable = {
  427: '!',
  428: '?',
  429: ',',
  430: '.',
  431: '…',
  432: '·',
  435: '\'',
  441: '(',
  442: ')',
  443: '♂',
  444: '♀',
  446: '-',
  451: '~',
  464: '@',
  478: ' ',
};
addRangeToTable(encodingTable, 299, 'A', 26);
addRangeToTable(encodingTable, 325, 'a', 26);
addRangeToTable(encodingTable, 289, '0', 10);

const isNotEndCode = code => code !== 0xFFFF;

function decodeSymbol(code) {
  return encodingTable[code] || '?';
}

function decodeString(seq) {
  return takeWhile(seq, isNotEndCode).map(decodeSymbol).join('');
}

module.exports = { encodingTable, decodeSymbol, decodeString };
