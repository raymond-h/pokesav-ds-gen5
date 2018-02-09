const path = require('path');
const fse = require('fs-extra');
const yaml = require('js-yaml');
const KaitaiStructCompiler = require('kaitai-struct-compiler');

async function readKsyFile(path) {
  const ksyStr = await fse.readFile(path, { encoding: 'utf8' });

  return yaml.safeLoad(ksyStr, { filename: path });
}

async function main() {
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
        files[file],
        { encoding: 'utf8' }
      );
    })
  );

  console.log(`Compiled files: ${Object.keys(files).join(', ')}`);
}

main()
  .catch(err => console.error(err));
