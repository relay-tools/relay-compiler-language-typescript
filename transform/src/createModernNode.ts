import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as ts from 'typescript';

import { print } from "graphql";

const GENERATED = './__generated__/';

import { OperationDefinitionNode, FragmentDefinitionNode } from "graphql";
import { NormalizedOptions } from "./Options";

function createVariableStatement(type: ts.NodeFlags.Const | ts.NodeFlags.Let | undefined, name: ts.Identifier, initializer: ts.Expression): ts.VariableStatement {
  return ts.createVariableStatement(
    undefined,
    ts.createVariableDeclarationList(
      [
        ts.createVariableDeclaration(
          name,
          undefined,
          initializer
        ),
      ],
      type,
    ),
  );
}

/**
 * Relay Modern creates separate generated files, so TS transforms graphql
 * definitions to lazy require function calls.
 */
export function createModernNode(
  ctx: ts.TransformationContext,
  opts: NormalizedOptions,
  graphqlDefinition: OperationDefinitionNode | FragmentDefinitionNode,
  fileName: string,
): ts.Expression {
  const definitionName = graphqlDefinition.name && graphqlDefinition.name.value;
  if (!definitionName) {
    throw new Error('GraphQL operations and fragments must contain names');
  }
  const requiredFile = definitionName + '.graphql.ts';
  const requiredPath = opts.artifactDirectory
    ? getRelativeImportPath(fileName, opts.artifactDirectory, requiredFile)
    : GENERATED + requiredFile;

  const hash = crypto
    .createHash('md5')
    .update(print(graphqlDefinition), 'utf8')
    .digest('hex');

  const requireGraphQLModule = ts.createPropertyAccess(ts.createCall(ts.createIdentifier('require'), undefined, [
    ts.createLiteral(requiredPath),
  ]), ts.createIdentifier('default'));

  const bodyStatements: ts.Statement[] = [ts.createReturn(requireGraphQLModule)];
  if (opts.isDevVariable != null || opts.isDevelopment) {
    const nodeVariable = ts.createIdentifier('node');
    const nodeDotHash = ts.createPropertyAccess(nodeVariable, ts.createIdentifier('hash'));
    let checkStatements: ts.Statement[] = [
      createVariableStatement(ts.NodeFlags.Const, nodeVariable, requireGraphQLModule),
      ts.createIf(
        ts.createLogicalAnd(
          nodeDotHash,
          ts.createStrictInequality(nodeDotHash, ts.createLiteral(hash)),
        ),
        ts.createBlock([
          ts.createStatement(
            warnNeedsRebuild(definitionName, opts.buildCommand),
          ),
        ], /* multiLine */ true),
      ),
    ];
    if (opts.isDevVariable != null) {
      checkStatements = [
        ts.createIf(
          ts.createIdentifier(opts.isDevVariable),
          ts.createBlock(checkStatements, /* multiLine */ true),
        ),
      ];
    }
    bodyStatements.unshift(...checkStatements);
  }
  return ts.createFunctionExpression(undefined, undefined, undefined, undefined, [], undefined, ts.createBlock(bodyStatements, /* multiLine */ true));
}

function warnNeedsRebuild(
  definitionName: string,
  buildCommand?: string,
): ts.Expression {
  return ts.createCall(
    ts.createPropertyAccess(ts.createIdentifier('console'), ts.createIdentifier('error')),
    undefined,
    [
      ts.createLiteral(
        `The definition of '${definitionName}' appears to have changed. Run ` +
        '`' +
        (buildCommand || 'relay-compiler') +
        '` to update the generated files to receive the expected data.',
      ),
    ],
  );
}

function getRelativeImportPath(
  fileName: string,
  artifactDirectory: string,
  fileToRequire: string,
): string {
  return path.join(artifactDirectory, fileToRequire);
}
