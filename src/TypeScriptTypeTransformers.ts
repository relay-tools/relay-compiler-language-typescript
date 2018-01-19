import * as ts from "typescript";

import {
  GraphQLEnumType,
  GraphQLInputType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType
} from "graphql";

import { TypeGeneratorOptions } from 'relay-compiler'

export type ScalarTypeMapping = {
  [type: string]: string;
};

export type State = {
  usedEnums: { [name: string]: GraphQLEnumType };
  usedFragments: Set<string>;
  // TODO: Marking these as optional and moved from ‘options’ to ‘state’ until we determine how we can best make imports
  //       work.
  getGeneratedDirectory?: (name: string) => CodegenDirectory;
  destinationDirectory?: CodegenDirectory;
} & TypeGeneratorOptions;

export function transformScalarType(
  type: GraphQLType,
  state: State,
  objectProps?: ts.TypeNode
): ts.TypeNode {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableScalarType(type.ofType, state, objectProps);
  } else {
    return ts.createUnionTypeNode([
      transformNonNullableScalarType(type, state, objectProps),
      ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword)
    ]);
  }
}

function transformNonNullableScalarType(
  type: GraphQLType,
  state: State,
  objectProps?: ts.TypeNode
): ts.TypeNode {
  if (type instanceof GraphQLList) {
    return ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
      transformScalarType(type.ofType, state, objectProps)
    ]);
  } else if (
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLUnionType ||
    type instanceof GraphQLInterfaceType
  ) {
    return objectProps!;
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type, state);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type, state);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

function transformGraphQLScalarType(
  type: GraphQLScalarType,
  state: State
): ts.TypeNode {
  switch (state.customScalars[type.name] || type.name) {
    case "ID":
    case "String":
    case "Url":
      return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case "Float":
    case "Int":
      return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "Boolean":
      return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    default:
      return ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  }
}

function transformGraphQLEnumType(
  type: GraphQLEnumType,
  state: State
): ts.TypeNode {
  state.usedEnums[type.name] = type;
  return ts.createTypeReferenceNode(ts.createIdentifier(type.name), []);
}

export function transformInputType(
  type: GraphQLInputType,
  state: State
): ts.TypeNode {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableInputType(type.ofType, state);
  } else {
    return ts.createUnionTypeNode([
      transformNonNullableInputType(type, state),
      ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword)
    ]);
  }
}

function transformNonNullableInputType(type: GraphQLInputType, state: State) {
  if (type instanceof GraphQLList) {
    return ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
      transformInputType(type.ofType, state)
    ]);
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type, state);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type, state);
  } else if (type instanceof GraphQLInputObjectType) {
    const fields = type.getFields();

    const props = Object.keys(fields)
      .map(key => fields[key])
      .filter(field => state.inputFieldWhiteList.indexOf(field.name) < 0)
      .map(field => {
        const property = ts.createPropertySignature(
          [ts.createToken(ts.SyntaxKind.ReadonlyKeyword)],
          ts.createIdentifier(field.name),
          field.type instanceof GraphQLNonNull
            ? ts.createToken(ts.SyntaxKind.QuestionToken)
            : undefined,
          transformInputType(field.type, state),
          undefined
        );
        return property;
      });
    return ts.createTypeLiteralNode(props);
  } else {
    throw new Error(
      `Could not convert from GraphQL type ${(type as GraphQLInputType).toString()}`
    );
  }
}
