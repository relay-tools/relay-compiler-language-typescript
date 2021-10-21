import { EnumTypeID, FieldID, Schema, TypeID } from "relay-compiler";
import { TypeGeneratorOptions } from "relay-compiler/lib/language/RelayLanguagePluginInterface";
import * as ts from "typescript";

export type ScalarTypeMapping = {
  [type: string]: string;
};

export type State = {
  generatedFragments: Set<string>;
  generatedInputObjectTypes: {
    [name: string]: ts.TypeLiteralNode | "pending";
  };
  matchFields: Map<string, ts.TypeNode>;
  runtimeImports: Set<string>;
  usedEnums: { [name: string]: TypeID };
  usedFragments: Set<string>;
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
      objectProps
    );
  } else {
    return ts.factory.createUnionTypeNode([
      transformNonNullableScalarType(schema, type, state, objectProps),
      ts.factory.createLiteralTypeNode(ts.factory.createNull()),
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
    return ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier("ReadonlyArray"),
      [
        transformScalarType(
          schema,
          schema.getListItemType(type),
          state,
          objectProps
        ),
      ]
    );
  } else if (
    schema.isObject(type) ||
    schema.isUnion(type) ||
    schema.isInterface(type)
  ) {
    return objectProps!;
  } else if (schema.isScalar(type)) {
    return transformGraphQLScalarType(schema.getTypeString(type), state);
  } else if (schema.isEnum(type)) {
    return transformGraphQLEnumType(schema, schema.assertEnumType(type), state);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
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
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case "Float":
    case "Int":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "Boolean":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);

    default:
      return customType
        ? ts.factory.createTypeReferenceNode(customType, undefined)
        : ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }
}

function transformGraphQLEnumType(
  schema: Schema,
  type: EnumTypeID,
  state: State
): ts.TypeNode {
  state.usedEnums[schema.getTypeString(type)] = type;
  return ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier(schema.getTypeString(type)),
    []
  );
}

export function transformInputType(
  schema: Schema,
  type: TypeID,
  state: State,
  options: {
    inputObjectProperty?: boolean | undefined;
  } = {}
): ts.TypeNode {
  const { inputObjectProperty } = options;
  if (schema.isNonNull(type)) {
    return transformNonNullableInputType(
      schema,
      schema.getNullableType(type),
      state
    );
  } else if (inputObjectProperty) {
    return ts.factory.createUnionTypeNode([
      transformNonNullableInputType(schema, type, state),
      ts.factory.createLiteralTypeNode(ts.factory.createNull()),
      // add undefined to support exactOptionalPropertyTypes
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UndefinedKeyword),
    ]);
  } else {
    return ts.factory.createUnionTypeNode([
      transformNonNullableInputType(schema, type, state),
      ts.factory.createLiteralTypeNode(ts.factory.createNull()),
    ]);
  }
}

function transformNonNullableInputType(
  schema: Schema,
  type: TypeID,
  state: State
) {
  if (schema.isList(type)) {
    return ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier("Array"),
      [transformInputType(schema, schema.getListItemType(type), state)]
    );
  } else if (schema.isScalar(type)) {
    return transformGraphQLScalarType(schema.getTypeString(type), state);
  } else if (schema.isEnum(type)) {
    return transformGraphQLEnumType(schema, schema.assertEnumType(type), state);
  } else if (schema.isInputObject(type)) {
    const typeIdentifier = getInputObjectTypeIdentifier(schema, type);
    if (state.generatedInputObjectTypes[typeIdentifier]) {
      return ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(typeIdentifier),
        []
      );
    }
    state.generatedInputObjectTypes[typeIdentifier] = "pending";

    const fields = schema.getFields(schema.assertInputObjectType(type));

    const props = fields.map((fieldID: FieldID) => {
      const fieldType = schema.getFieldType(fieldID);
      const fieldName = schema.getFieldName(fieldID);
      const property = ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier(fieldName),
        state.optionalInputFields.indexOf(fieldName) >= 0 ||
          !schema.isNonNull(fieldType)
          ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
          : undefined,
        transformInputType(schema, fieldType, state, {
          inputObjectProperty: true,
        })
      );

      return property;
    });
    state.generatedInputObjectTypes[typeIdentifier] =
      ts.factory.createTypeLiteralNode(props);
    return ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier(typeIdentifier),
      []
    );
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}
