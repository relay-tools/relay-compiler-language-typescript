import * as ts from 'typescript';
import { parse } from 'graphql';
import * as fs from 'fs';
import { getValidGraphQLTag } from './getValidGraphQLTag';
import { NormalizedOptions, normalizeOptions, Options } from './Options';
import { compileGraphQLTag } from './compileGraphQLTag';
import { getValidRelayQLTag } from './getValidRelayQLTag';
import { compileRelayQLTag } from './compileRelayQLTag';

// https://github.com/Microsoft/TypeScript/blob/cc6d18e4db924d05e55c2a22587ad47ba53e7989/src/compiler/types.ts#L4490
const enum TransformFlags {
  ContainsES2015 = 1 << 7
}

interface ExtraNode {
  transformFlags: TransformFlags;
}

function insertVarDecl(varDecl: ts.Statement, insertInto: ts.NodeArray<ts.Statement>): ts.Statement[] {
  const useStrictIdx = insertInto.findIndex(
    stmt => ts.isExpressionStatement(stmt) && ts.isLiteralExpression(stmt.expression) && stmt.expression.text == 'use strict'
  );
  if (useStrictIdx >= 0) {
    const newStmts = insertInto.slice(0);
    newStmts.splice(useStrictIdx + 1, 0, varDecl);
    return newStmts;
  }
  return [varDecl, ...insertInto];
}

function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile, opts: NormalizedOptions): ts.Visitor {
  const fileName = sf.fileName;
  let i = 0;
  const varDecls: ts.VariableDeclaration[] = [];
  function declareVar(id: ts.Identifier): void {
    varDecls.push(ts.createVariableDeclaration(id, undefined, undefined));
  }
  let scopeLevel = 0;
  const visit = (node: ts.Node): ts.Node => {
    // Easy bailout if there are not ES2015 features used
    if (((node as any as ExtraNode).transformFlags & TransformFlags.ContainsES2015) !== TransformFlags.ContainsES2015) {
      return node;
    }
    if (ts.isBlock(node)) {
      scopeLevel++;
    }

    if (ts.isTaggedTemplateExpression(node)) {
      const ast = getValidGraphQLTag(node);
      if (ast) {
        const res = compileGraphQLTag(ctx, opts, node, ast, fileName);
        if (scopeLevel > 0) {
          const id = ts.createIdentifier('__graphql$' + i++);
          declareVar(id);
          return ts.createLogicalOr(id, ts.createAssignment(id, res));
        }
        return res;
      }

      const relayQLTag = getValidRelayQLTag(node);
      if (relayQLTag != null) {
        if (opts.relayQLTransformer == null) {
          throw new Error(
            'typescript-transform-relay: Missing schema option. ' +
            'Check your configuration for TypeScript and ensure you\'ve set a path for your GraphQL schema.'
          );
        }
        const result = compileRelayQLTag(ctx, opts, opts.relayQLTransformer, node, sf.fileName, relayQLTag[2], relayQLTag[1], true);
        ts.setSourceMapRange(result, ts.getSourceMapRange(node));
        return result;
      }
    }
    const res = ts.visitEachChild(node, visit, ctx);

    if (ts.isSourceFile(res) && varDecls.length > 0) {
      const varDecl = ts.createVariableStatement(undefined, ts.createVariableDeclarationList(varDecls));
      return ts.updateSourceFileNode(res, insertVarDecl(varDecl, res.statements));
    }
    if (ts.isBlock(node)) {
      scopeLevel--;
    }
    return res;
  };

  return visit;
}

export function transformer(opts?: Options) {
  const options = normalizeOptions(opts || {});
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sf: ts.SourceFile): ts.SourceFile => ts.visitNode(sf, visitor(context, sf, options));
  }
}
