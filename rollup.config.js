export default {
  input: 'lib/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true
  },
  external: ['kaitai-struct', 'crc', 'assert', 'string_decoder', 'lodash.chunk']
};
