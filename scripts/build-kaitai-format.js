const path = require('path');
const fse = require('fs-extra');
const yaml = require('js-yaml');
const falafel = require('falafel');
const KaitaiStructCompiler = require('kaitai-struct-compiler');

async function readKsyFile(path) {
  const ksyStr = await fse.readFile(path, { encoding: 'utf8' });

  return yaml.safeLoad(ksyStr, { filename: path });
}

function transformJs(src) {
  return falafel(src, node => {
    if(node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'require' &&
      node.arguments[0].type === 'Literal') {

      const match = /^pokesav[\\/](.+)$/.exec(node.arguments[0].value);

      if(match != null) {
        node.update(`require('../lib/decrypt-process.js').${match[1]}`);
      }
    }
  });
}

async function main() {
  console.log("Compiling format '../formats/pokesav-dppt.ksy'");

  const ksyData = await readKsyFile(
    path.join(__dirname, '../formats/pokesav-dppt.ksy')
  );

  const compiler = new KaitaiStructCompiler();

  const files = await compiler.compile('javascript', ksyData, null, false);

  await fse.mkdirp(
    path.join(__dirname, '../formats-compiled')
  );

  await Promise.all(
    Object.keys(files).map(async file => {
      return await fse.writeFile(
        path.join(__dirname, '../formats-compiled', file),
        transformJs(files[file]).toString(),
        { encoding: 'utf8' }
      );
    })
  );

  console.log(`Compiled files: ${Object.keys(files).join(', ')}`);
}

main()
  .catch(err => console.error(err));
