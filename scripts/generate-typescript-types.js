import fse from 'fs-extra';
import { resolve } from 'path';
import yaml from 'js-yaml';
import camelCase from 'camelcase';
import minimist from 'minimist';

import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function readKsyFile(path) {
  const ksyStr = await fse.readFile(path, { encoding: 'utf8' });

  return yaml.safeLoad(ksyStr, { filename: path });
}

const handledKeys = ['meta', 'instances', 'enums', 'types', 'seq'];
const numericTypeRegex = /^([usb]\d+)(?:[lb]e)?$/;

function tsTypeFromKsyType(typeName, propertyName, ksyObj, isValidUserDeclaredType, tsTypeOverrides) {
  if (typeName in tsTypeOverrides && propertyName in tsTypeOverrides[typeName])
    return tsTypeOverrides[typeName][propertyName];

  if ('repeat' in ksyObj) {
    const { repeat, ...rest } = ksyObj;
    const innerType = tsTypeFromKsyType(typeName, propertyName, rest, isValidUserDeclaredType, tsTypeOverrides);

    if (repeat === 'expr' && typeof rest['repeat-expr'] === 'number' && rest['repeat-expr'] < 10) {
      return `[${Array(rest['repeat-expr']).fill(innerType).join(', ')}]`;
    }

    return `Array<${innerType}>`;
  }

  if (typeof ksyObj.enum === 'string' && isValidUserDeclaredType(ksyObj.enum) != null) {
    return isValidUserDeclaredType(ksyObj.enum) + camelCase(ksyObj.enum, { pascalCase: true });
  }

  if (ksyObj.process === 'pokesav.string_decode') {
    return 'string';
  }

  if (ksyObj.type === 'str' && 'size' in ksyObj) {
    return 'string';
  }

  if (!('type' in ksyObj) && 'size' in ksyObj) {
    return 'Buffer';
  }

  if (typeof ksyObj.type === 'string') {
    if (isValidUserDeclaredType(ksyObj.type) != null) {
      return isValidUserDeclaredType(ksyObj.type) + camelCase(ksyObj.type, { pascalCase: true });
    }

    const m = numericTypeRegex.exec(ksyObj.type);
    if (m) {
      return m[1] === 'b1' ? 'boolean' : 'number';
    }
  }

  console.error(`WARNING: ${typeName}.${propertyName} has unknown type, modify 'typescript-types-override.json' to manually specify a type for it.`);
  return 'unknown';
}

function generateTSDeclarationForType(typeName, type, isValidUserDeclaredTypeInParent, tsTypeOverrides) {
  // console.log('Handling type', typeName, Object.keys(type));

  const newKeys = Object.keys(type).filter(k => !handledKeys.includes(k));
  if (newKeys.length > 0) {
    throw new Error(`UNHANDLED KEYS ${newKeys} in ${typeName}`);
  }

  const isValidUserDeclaredType = (innerTypeName) => {
    if (isValidUserDeclaredTypeInParent(innerTypeName)) return '';

    if ('enums' in type && innerTypeName in type.enums) {
      return `${typeName}.`;
    }

    if ('types' in type && innerTypeName in type.types) {
      return `${typeName}.`;
    }

    return null;
  };

  const clazz = {};
  if ('seq' in type) {
    for (const seqEntry of type.seq) {
      clazz[camelCase(seqEntry.id)] =
        tsTypeFromKsyType(typeName, camelCase(seqEntry.id), seqEntry, isValidUserDeclaredType, tsTypeOverrides);
    }
  }
  if ('instances' in type) {
    for (const [instName, instDecl] of Object.entries(type.instances)) {
      clazz[camelCase(instName)] =
        tsTypeFromKsyType(typeName, camelCase(instName), instDecl, isValidUserDeclaredType, tsTypeOverrides);
    }
  }

  const namespace = [];
  if ('enums' in type) {
    for (const [enumName, enumPairs] of Object.entries(type.enums)) {
      namespace.push({
        type: 'enum',
        name: camelCase(enumName, { pascalCase: true }),
        values: Object.fromEntries(
          Object.entries(enumPairs).map(([value, name]) => [name.toUpperCase(), parseInt(value, 10)])
        )
      });
    }
  }
  if ('types' in type) {
    for (const [typeName, innerTypeData] of Object.entries(type.types)) {
      namespace.push(
        generateTSDeclarationForType(
          camelCase(typeName, { pascalCase: true }),
          innerTypeData,
          isValidUserDeclaredType,
          tsTypeOverrides
        )
      );
    }
  }

  return { type: 'type', name: typeName, clazz, namespace };
}

function convertTypescriptJsonToText(tsObj) {
  const out = [];

  if (tsObj.type === 'type') {
    out.push(`class ${tsObj.name} {`);
    out.push(...Object.entries(tsObj.clazz).map(([name, type]) => `${name}: ${type};`));
    out.push('}');

    if (tsObj.namespace.length > 0) {
      out.push('');
      out.push(`namespace ${tsObj.name} {`);
      out.push(...tsObj.namespace.map(innerTsObj => convertTypescriptJsonToText(innerTsObj)).flat());
      out.push('}');
    }
  }
  else if (tsObj.type === 'enum') {
    out.push(`enum ${tsObj.name} {`);
    out.push(...Object.entries(tsObj.values).map(([name, value]) => `${name} = ${value},`));
    out.push('}');
  }
  else {
    throw new Error(`Unknown TS entity type ${tsObj.type}`);
  }

  out.push('');

  return out;
}

async function generateTypescriptTypesFromFile(file) {
  const tsTypeOverrides = await fse.readJson(resolve(__dirname, 'typescript-types-override.json'));
  const ksyData = await readKsyFile(file);

  // console.log(ksyData);
  const out = generateTSDeclarationForType(camelCase(ksyData.meta.id, { pascalCase: true }), ksyData, () => false, tsTypeOverrides);

  // await fse.writeJson('typescript-ast.json', out, { spaces: '  ' });

  const tsOut = [
    "declare module 'pokesav-ds-gen5' {",
    "import { Buffer } from 'buffer';",
    '',
    'function fromBuffer(buffer: Buffer): PokesavDsGen5;',
    '',
    ...convertTypescriptJsonToText(out),
    '}'
  ].join('\n');

  await fse.writeFile('pokesav-ds-gen5_WIP.d.ts', tsOut);
}

async function main() {
  await generateTypescriptTypesFromFile('./formats/pokesav-ds-gen5.ksy');
}

main(
  minimist(process.argv.slice(2), {})
)
  .catch(err => console.error(err));
