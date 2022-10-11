import { join } from 'path';
import fse from 'fs-extra';
import yaml from 'js-yaml';
import falafel from 'falafel';
import KaitaiStructCompiler from 'kaitai-struct-compiler';
import minimist from 'minimist';

import glob from 'glob';
import { promisify } from 'util';
const globAsync = promisify(glob);

import { umdToEsm } from './helpers/convert-umd-to-esm.js';

async function readKsyFile(path) {
  const ksyStr = await fse.readFile(path, { encoding: 'utf8' });

  return yaml.safeLoad(ksyStr, { filename: path });
}

function fixProjectSpecificIssues(src) {
  const isStaticCommonJsRequireCall = (node) => node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0].type === 'Literal';

  const isIife = (node) => node.type === 'CallExpression' && node.callee.type === 'FunctionExpression';

  return falafel(src, node => {
    if (isStaticCommonJsRequireCall(node)) {
      const match = /^pokesav[\\/](.+)$/.exec(node.arguments[0].value);

      if (match != null) {
        node.update(`require('../lib/decrypt-process.js').${match[1]}`);
      }
      else if (node.arguments[0].value === 'kaitai-struct/KaitaiStream') {
        node.update("require('kaitai-struct').KaitaiStream");
      }
    }

    // mark all IIFEs as pure, so ESM bundlers can tree shake them
    // mostly useful for the outermost class representing the KSY file as a whole
    if (isIife(node)) {
      node.update(`/*#__PURE__*/ ${node.source()}`);
    }
  }).toString();
}

function transformJs(src) {
  return umdToEsm(fixProjectSpecificIssues(src));
}

async function compileFile(file, outputDir) {
  const ksyData = await readKsyFile(file);

  const compiler = new KaitaiStructCompiler();

  const files = await compiler.compile('javascript', ksyData, null, false);

  await fse.mkdirp(outputDir);

  await Promise.all(
    Object.keys(files).map(async file => {
      return await fse.writeFile(
        join(outputDir, file),
        transformJs(files[file]),
        { encoding: 'utf8' }
      );
    })
  );

  return Object.keys(files);
}

async function main(argv) {
  let files = argv._;

  if (argv.source) {
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
  minimist(process.argv.slice(2), {
    alias: {
      outputDirectory: ['d'],
      source: ['s']
    }
  })
)
  .catch(err => console.error(err));
