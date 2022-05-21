const { StringDecoder } = require('string_decoder');
const chunk = require('lodash.chunk');

const uniqueCharacterMappings = {
  '⑴': '⊙',
  '⑵': '○',
  '⑶': '□',
  '⑷': '△',
  '⑸': '◇',
  '⑹': '♪',
  '⑺': '☀',
  '⑻': '☁',
  '⑼': '☂',
  '⑽': '☃️',
  '⑾': '🙂',
  '⑿': '😄',
  '⒀': '😫',
  '⒁': '😠',
  '⒂': '⤴️',
  '⒃': '⤵️',
  '⒄': '💤',
  '⑧': '×',
  '⑨': '÷',
  '⑬': '…',
  '⑭': '♂',
  '⑮': '♀',
  '⑯': '♠',
  '⑰': '♣',
  '⑱': '♥',
  '⑲': '♦',
  '⑳': '★'
};

const uniqueCharacterRegEx = /[⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⑧⑨⑬⑭⑮⑯⑰⑱⑲⑳]/g;

const isEndCode = pair => (pair[0] == endCode[0] && pair[1] == endCode[1]);

const decoder = new StringDecoder('ucs2');
const endCode = Uint8Array.of(0xFF, 0xFF);

function decodeString(seq) {
  const endIndex = chunk(seq, 2).findIndex(isEndCode) * 2;
  return decoder.end(Buffer.from(seq.slice(0, endIndex >= 0 ? endIndex : seq.length))).replaceAll(uniqueCharacterRegEx, c => uniqueCharacterMappings[c]);
}

module.exports = { decodeString };
