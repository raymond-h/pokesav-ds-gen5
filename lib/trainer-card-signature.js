function reorderSignaturePixelRows(data, bytesPerRow, outBuffer) {
  const outBuf = outBuffer || Buffer.allocUnsafe(data.length);

  for(let i = 0; i < data.length; i+=8) {
    for(let j = 0; j < 8; j++) {
      outBuf.writeUInt8(data.readUInt8(i+j), Math.floor(i / 8) + j*bytesPerRow);
    }
  }

  return outBuf;
}

module.exports = { reorderSignaturePixelRows };
