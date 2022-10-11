import { strictEqual, ok, fail } from 'assert';
import falafel from 'falafel';

function findParent(node, pred) {
  const inner = (node) => {
    if (pred(node)) return node;
    else if (node.parent == null) return null;
    return inner(node.parent);
  };

  return inner(node.parent);
}

function strictZip(a, b) {
  strictEqual(a.length, b.length);

  return a.map((x, i) => [x, b[i]]);
}

function findInIfElseIfChainSyntaxTree(node, pred) {
  strictEqual(node.type, 'IfStatement');

  if (pred(node.consequent)) {
    return node.consequent;
  }
  else if (node.alternate != null && node.alternate.type === 'IfStatement') {
    return findInIfElseIfChainSyntaxTree(node.alternate, pred);
  }
  else if (node.alternate != null) {
    return pred(node.alternate) ? node.alternate : null;
  }
}

function isCommonJsModuleExportsAssignment(expr) {
  return expr.type === 'AssignmentExpression' && expr.operator === '=' && expr.left.source() === 'module.exports';
}

// This function is specifically tuned for kaitai-struct-compiler's output
// and so there is a lot of more general cases that this can't convert
function umdToCjs(src) {
  const isRootIifeFunction = node => node.type === 'FunctionExpression' &&
    node.id === null &&
    node.params.length === 2 &&
    node.params[0].name === 'root' &&
    node.params[1].name === 'factory';

  return falafel(src, node => {
    if (node.type === 'CallExpression' && isRootIifeFunction(node.callee)) {
      const cjsBlock = findInIfElseIfChainSyntaxTree(
        node.callee.body.body[0],
        node => isCommonJsModuleExportsAssignment(node.body[0].expression)
      );
      const factoryCallNode = cjsBlock.body[0].expression.right;
      ok(factoryCallNode.type === 'CallExpression' && factoryCallNode.callee.name === 'factory');

      const requireCalls = factoryCallNode.arguments.map(a => a.source());
      const requireNames = node.arguments[1].params.map(p => p.name);

      const topLevelVars = node.arguments[1].body.body.filter(n => n.type === 'VariableDeclaration');
      const returnedExprNode = node.arguments[1].body.body.find(n => n.type === 'ReturnStatement').argument;

      const lines = [];
      for (const [name, call] of strictZip(requireNames, requireCalls)) {
        lines.push(`const ${name} = ${call};`);
      }

      for (const topLevelVar of topLevelVars) {
        lines.push(topLevelVar.source());
      }

      lines.push(`module.exports = ${returnedExprNode.source()};`);

      node.parent.update(lines.join('\n'));
    }
  }).toString();
}

// This function is specifically tuned for kaitai-struct-compiler's output
// and so there is a lot of more general cases that this can't convert
function cjsToEsm(src) {
  const isStaticCommonJsRequireCall = (node) => node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0].type === 'Literal';

  return falafel(src, node => {
    if (isStaticCommonJsRequireCall(node)) {
      const decl = findParent(node, (node) => node.type === 'VariableDeclaration');

      strictEqual(decl.declarations.length, 1);
      strictEqual(decl.kind, 'const');

      if (decl.declarations[0].init.type === 'MemberExpression' && decl.declarations[0].init.object === node) {
        const moduleNameLiteral = node.arguments[0];
        const memberName = decl.declarations[0].init.property.name;
        const varName = decl.declarations[0].id.name;

        if (memberName !== varName) {
          decl.update(`import { ${memberName} as ${varName} } from ${moduleNameLiteral.source()};`);
        }
        else {
          decl.update(`import { ${memberName} } from ${moduleNameLiteral.source()};`);
        }
      }
      else if (decl.declarations[0].init === node) {
        const moduleNameLiteral = node.arguments[0];
        const varName = decl.declarations[0].id.name;

        decl.update(`import ${varName} from ${moduleNameLiteral.source()};`);
      }
      else {
        fail('Expected require() only to be used like "const X = require(...)" or "const X = require(...).member"');
      }
    }

    if (isCommonJsModuleExportsAssignment(node)) {
      node.parent.update(`export default ${node.right.source()};`);
    }
  }).toString();
}

function umdToEsm(src) {
  // Pass 1: remove UMD wrapper and turn the code into just fairly normal CommonJS
  const pass1Result = umdToCjs(src);

  // Pass 2: Replace CommonJS with ESM syntax
  const pass2Result = cjsToEsm(pass1Result);

  return pass2Result;
}

export { umdToCjs, cjsToEsm, umdToEsm };
