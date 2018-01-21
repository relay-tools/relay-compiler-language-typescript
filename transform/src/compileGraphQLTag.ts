// const createClassicNode = require('./createClassicNode');
// const createCompatNode = require('./createCompatNode');
import { createModernNode } from "./createModernNode";
import { getFragmentNameParts } from "./getFragmentNameParts";
import { DocumentNode, FragmentDefinitionNode, OperationDefinitionNode } from "graphql";
import * as ts from 'typescript';
import { NormalizedOptions } from "./Options";
import { createCompatNode } from "./createCompatNode";
import { createClassicNode } from "./createClassicNode";
import { bindingsAtNode } from "./bindingsAtNode";
import { setSourceMapRange } from "typescript";

/**
 * Given a graphql`` tagged template literal, replace it with the appropriate
 * runtime artifact.
 */
export function compileGraphQLTag(
  ctx: ts.TransformationContext,
  opts: NormalizedOptions,
  node: ts.TaggedTemplateExpression,
  ast: DocumentNode,
  fileName: string,
): ts.Expression {
  const mainDefinition = ast.definitions[0];

  if (mainDefinition.kind === 'FragmentDefinition') {
    const objPropName = getAssignedObjectPropertyName(node);
    if (objPropName) {
      if (ast.definitions.length !== 1) {
        throw new Error(
          'TSTransformRelay: Expected exactly one fragment in the ' +
          `graphql tag referenced by the property ${objPropName}.`,
        );
      }
      return createAST(ctx, opts, node, mainDefinition, fileName, true);
    }

    const nodeMap: { [key: string]: ts.Expression } = {};
    for (const definition of ast.definitions) {
      if (definition.kind !== 'FragmentDefinition') {
        throw new Error(
          'TSTransformRelay: Expected only fragments within this ' +
          'graphql tag.',
        );
      }

      const [, propName] = getFragmentNameParts(definition.name.value);
      nodeMap[propName] = createAST(ctx, opts, node, definition, fileName, false);
    }
    return createObject(nodeMap, node);
  }

  if (mainDefinition.kind === 'OperationDefinition') {
    if (ast.definitions.length !== 1) {
      throw new Error(
        'TSTransformRelay: Expected exactly one operation ' +
        '(query, mutation, or subscription) per graphql tag.',
      );
    }
    return createAST(ctx, opts, node, mainDefinition, fileName, true);
  }

  throw new Error(
    'TSTransformRelay: Expected a fragment, mutation, query, or ' +
    'subscription, got `' +
    mainDefinition.kind +
    '`.',
  );
}

function createAST(
  ctx: ts.TransformationContext,
  opts: NormalizedOptions,
  node: ts.TaggedTemplateExpression,
  graphqlDefinition: FragmentDefinitionNode | OperationDefinitionNode,
  fileName: string,
  setSoueceMapRange: boolean,
) {
  const isCompatMode = Boolean(opts.compat);
  const isDevVariable = opts.isDevVariable;
  const artifactDirectory = opts.artifactDirectory;
  const buildCommand =
    (opts.buildCommand) || 'relay-compiler';

  // Fallback is 'true'
  const isDevelopment =
    (process.env.NODE_ENV) !== 'production';

  const modernNode = createModernNode(ctx, opts, graphqlDefinition, fileName);
  if (isCompatMode) {
    console.log('Launching compat mode!');
    const result = createCompatNode(
      modernNode,
      createClassicNode(ctx, bindingsAtNode(node), node, graphqlDefinition, opts),
    );
    console.log('Done generating stuff');
    if (setSourceMapRange) {
      ts.setSourceMapRange(result, ts.getSourceMapRange(node));
    }
    return result;
  }
  if (setSourceMapRange) {
    ts.setSourceMapRange(modernNode, ts.getSourceMapRange(node));
  }
  return modernNode;
}

const idRegex = /^[$a-zA-Z_][$a-z0-9A-Z_]*$/;

function createObject(obj: { [propName: string]: ts.Expression }, originalNode: ts.Node) {
  const propNames = Object.keys(obj);

  const assignments = propNames.map(propName => {
    const name = idRegex.test(propName) ? ts.createIdentifier(propName) : ts.createLiteral(propName);
    return ts.createPropertyAssignment(name, obj[propName])
  });

  const objectLiteralNode = ts.createObjectLiteral(assignments, /* multiLine */ true);
  ts.setSourceMapRange(objectLiteralNode, ts.getSourceMapRange(originalNode));
  return objectLiteralNode;
}

function getAssignedObjectPropertyName(node: ts.Node): string | undefined {
  if (node.parent == null) {
    return undefined;
  }

  if (!ts.isPropertyAssignment(node.parent)) {
    return undefined;
  }

  const propName = node.parent.name;

  if (ts.isIdentifier(propName)) {
    return propName.text;
  }
  if (ts.isStringLiteral(propName)) {
    return propName.text;
  }
  return undefined;
}
