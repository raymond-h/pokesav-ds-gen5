const reverseByteBits = n => {
  let inTmp = n;
  let out = 0;
  for (let i = 0; i < 8; i++) {
    out = (out << 1) | (inTmp & 1);
    inTmp >>= 1;
  }
  return out;
};

function reorderSignaturePixelRows(data, bytesPerRow, outBuffer) {
  const outBuf = outBuffer || Buffer.allocUnsafe(data.length);

  for (let i = 0; i < data.length; i++) {
    const inX = Math.floor(i / 8) % bytesPerRow;
    const inY = (i % 8) + Math.floor(i / (8 * bytesPerRow)) * 8;

    const outOffset = inY * bytesPerRow + inX;

    outBuf.writeUInt8(
      reverseByteBits(data.readUInt8(i)),
      outOffset
    );
  }

  return outBuf;
}

export { reorderSignaturePixelRows };
