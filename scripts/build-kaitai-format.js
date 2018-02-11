const path = require('path');
const fse = require('fs-extra');
const yaml = require('js-yaml');
const falafel = require('falafel');
const KaitaiStructCompiler = require('kaitai-struct-compiler');

const glob = require('glob');
const util = require('util');
const globAsync = util.promisify(glob);

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

async function compileFile(file, outputDir) {
  const ksyData = await readKsyFile(file);

  const compiler = new KaitaiStructCompiler();

  const files = await compiler.compile('javascript', ksyData, null, false);

  await fse.mkdirp(outputDir);

  await Promise.all(
    Object.keys(files).map(async file => {
      return await fse.writeFile(
        path.join(outputDir, file),
        transformJs(files[file]).toString(),
        { encoding: 'utf8' }
      );
    })
  );

  return Object.keys(files);
}

async function main(argv) {
  let files = argv._;

  if(argv.source) {
    const globFiles = await globAsync(argv.source);
    files = files.concat(globFiles || []);
  }

  const fileArrays = await Promise.all(files.map(async file => {
    console.log(`Compiling format '${file}'`);

    return await compileFile(file, argv.outputDirectory);
  }));

  console.log(`Compiled files: ${[].concat.apply([], fileArrays).join(', ')}`);
}

main(
  require('minimist')(process.argv.slice(2), {
    alias: {
      outputDirectory: ['d'],
      source: ['s']
    }
  })
)
  .catch(err => console.error(err));
