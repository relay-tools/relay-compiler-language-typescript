import {Schema, TypeID} from 'relay-compiler';
import { TypeGeneratorOptions } from "relay-compiler/lib/language/RelayLanguagePluginInterface";
import * as ts from "typescript";

export type ScalarTypeMapping = {
  [type: string]: string;
};

export type State = {
  usedEnums: { [name: string]: TypeID };
  usedFragments: Set<string>;
  generatedInputObjectTypes: {
    [name: string]: ts.TypeNode | "pending";
  };
  generatedFragments: Set<string>;
  matchFields: Map<string, ts.TypeNode>;
} & TypeGeneratorOptions;

function getInputObjectTypeIdentifier(schema: Schema, typeID: TypeID): string {
  return schema.getTypeString(typeID);
}

export function transformScalarType(
  schema: Schema,
  type: TypeID,
  state: State,
  objectProps?: ts.TypeNode
): ts.TypeNode {
  if (schema.isNonNull(type)) {
    return transformNonNullableScalarType(
      schema,
      schema.getNullableType(type),
      state,
      objectProps,
    );
  } else {
    return ts.createUnionTypeNode([
      transformNonNullableScalarType(schema, type, state, objectProps),
    ]);
  }
}

function transformNonNullableScalarType(
  schema: Schema,
  type: TypeID,
  state: State,
  objectProps?: ts.TypeNode
): ts.TypeNode {
  if (schema.isList(type)) {
    return ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
      transformScalarType(
        schema,
        schema.getNonListType(type),
        state,
        objectProps,
      ),
    ]);
  } else if (
    schema.isObject(type) ||
    schema.isUnion(type) ||
    schema.isInterface(type)
  ) {
    return objectProps!;
  } else if (schema.isScalar(type)) {
    return transformGraphQLScalarType(schema.getTypeString(type), state);
  } else if (schema.isEnum(type)) {
    return transformGraphQLEnumType(schema, type, state);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type as string}`);
  }
}

function transformGraphQLScalarType(
  typeName: string,
  state: State
): ts.TypeNode {
  const customType = state.customScalars[typeName];
  switch (customType || typeName) {
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
      return customType
        ? ts.createTypeReferenceNode(customType, undefined)
        : ts.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }
}

function transformGraphQLEnumType(
  schema: Schema,
  type: TypeID,
  state: State
): ts.TypeNode {
  state.usedEnums[schema.getTypeString(type)] = type;
  return ts.createTypeReferenceNode(ts.createIdentifier(schema.getTypeString(type)), []);
}

export function transformInputType(
  schema: Schema,
  type: TypeID,
  state: State
): ts.TypeNode {
  if (schema.isNonNull(type)) {
    return transformNonNullableInputType(
      schema,
      schema.getNullableType(type),
      state,
    );
  } else {
    return ts.createUnionTypeNode([
      transformNonNullableInputType(schema, type, state),
      ts.createKeywordTypeNode(ts.SyntaxKind.NullKeyword)
    ]);
  }
}

function transformNonNullableInputType(schema: Schema, typeID: TypeID, state: State) {
  if (schema.isList(typeID)) {
    return ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
      transformInputType(schema, schema.getNonListType(typeID), state),
    ]);
  } else if (schema.isScalar(typeID)) {
    return transformGraphQLScalarType(schema.getTypeString(typeID), state);
  } else if (schema.isEnum(typeID)) {
    return transformGraphQLEnumType(schema, typeID, state);
  } else if (schema.isInput(typeID)) {
    const typeIdentifier = getInputObjectTypeIdentifier(schema, typeID);
    if (state.generatedInputObjectTypes[typeIdentifier]) {
      return ts.createTypeReferenceNode(
        ts.createIdentifier(typeIdentifier),
        []
      );
    }
    state.generatedInputObjectTypes[typeIdentifier] = "pending";
    const fields = schema.getFields(typeID);

    const props = fields.map((fieldID: string) => {
      const fieldType = schema.getFieldType(fieldID);
      const fieldName = schema.getFieldName(fieldID);
      const property = ts.createPropertySignature(
        [ts.createToken(ts.SyntaxKind.ReadonlyKeyword)],
        ts.createIdentifier(fieldName),
        state.optionalInputFields.indexOf(fieldName) >= 0 || !schema.isNonNull(fieldType)
          ? ts.createToken(ts.SyntaxKind.QuestionToken)
          : undefined,
        transformInputType(schema, fieldType, state),
        undefined
      );
    });
    state.generatedInputObjectTypes[typeIdentifier] = ts.createTypeLiteralNode(
      props
    );
    return ts.createTypeReferenceNode(ts.createIdentifier(typeIdentifier), []);
  } else {
    throw new Error(
      `Could not convert from GraphQL type ${typeID as string}`
    );
  }
}
