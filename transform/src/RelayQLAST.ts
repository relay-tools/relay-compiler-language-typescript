/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @fullSyntaxTransform
 * @format
 */

'use strict';

import { RelayTransformError } from "./RelayTransformError";

import { find } from "./find";
import * as util from "util";

import { GraphQLRelayDirective } from "./GraphQLRelayDirective";
import { ID } from "./RelayQLNodeInterface";
import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLUnionType,
  isAbstractType,
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef,
  NamedTypeNode,
  GraphQLType,
  ASTNode,
  SelectionSetNode,
  ArgumentNode,
  DirectiveNode,
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  Location,
  OperationDefinitionNode,
  ValueNode,
  GraphQLSchema,
  NameNode,
} from "graphql";

// TODO: Import types from `graphql`.
type GraphQLSchemaArgumentType = any;
type GraphQLSchemaField = any;
type GraphQLSchemaType = any;

type RelayQLContext = {
  definitionName: string,
  generateID: () => string,
  isPattern: boolean,
  schema: GraphQLSchema,
};

type RelayQLSelection =
  | RelayQLField
  | RelayQLFragmentSpread
  | RelayQLInlineFragment;

type RelayQLNodeType = ASTNode & {
  selectionSet?: SelectionSetNode;
  directives?: DirectiveNode[];
  name?: NameNode;
}

class RelayQLNode<T extends RelayQLNodeType> {
  ast: T;
  context: RelayQLContext;

  constructor(context: RelayQLContext, ast: T) {
    this.ast = ast;
    this.context = context;
  }

  getLocation(): Location | undefined {
    return this.ast.loc;
  }

  getType(): RelayQLType {
    throw new Error("Missing Implementation");
  }

  getField(fieldName: string): RelayQLField | undefined {
    return find(this.getFields(), field => field.getName() === fieldName);
  }

  getFields(): Array<RelayQLField> {
    const fields: RelayQLField[] = [];
    this.getSelections().forEach(selection => {
      if (selection instanceof RelayQLField) {
        fields.push(selection);
      }
    });
    return fields;
  }

  getSelections(): Array<RelayQLSelection> {
    if (!this.ast.selectionSet) {
      return [];
    }
    // $FlowFixMe
    return this.ast.selectionSet.selections.map(selection => {
      if (selection.kind === 'Field') {
        return new RelayQLField(this.context, selection, this.getType());
      } else if (selection.kind === 'FragmentSpread') {
        return new RelayQLFragmentSpread(this.context, selection);
      } else if (selection.kind === 'InlineFragment') {
        return new RelayQLInlineFragment(
          this.context,
          selection,
          this.getType(),
        );
      } else {
        throw new RelayTransformError(
          util.format('Unexpected selection kind: %s', (selection as any).kind),
          this.getLocation(),
        );
      }
    });
  }

  getDirectives(): Array<RelayQLDirective> {
    // $FlowFixMe
    return (this.ast.directives || [])
      .filter(directive => directive.name.value !== 'fb_native_field')
      .map(directive => new RelayQLDirective(this.context, directive));
  }

  hasDirective(name: string): boolean {
    // $FlowFixMe
    return (this.ast.directives || []).some(d => d.name.value === name);
  }

  isPattern(): boolean {
    return this.context.isPattern;
  }
}

export class RelayQLDefinition<T extends RelayQLNodeType> extends RelayQLNode<T> {
  getName(): string {
    // TODO: this.context.definitionName;
    return this.ast.name
      ? // $FlowFixMe
      this.ast.name.value
      : this.getType().getName({ modifiers: false });
  }
}

export class RelayQLFragment extends RelayQLDefinition<
  // $FlowFixMe TT24544397
  FragmentDefinitionNode | InlineFragmentNode
  > {
  parentType: RelayQLType | undefined;

  constructor(
    context: RelayQLContext,
    ast: FragmentDefinitionNode | InlineFragmentNode,
    parentType?: RelayQLType,
  ) {
    const relayDirectiveArgs: { [key: string]: ValueNode } = {};
    const relayDirective = find(
      ast.directives || [],
      directive => directive.name.value === 'relay',
    );
    if (relayDirective) {
      (relayDirective.arguments || []).forEach(arg => {
        relayDirectiveArgs[arg.name.value] = arg.value;
      });
    }

    const patternArg = relayDirectiveArgs.pattern;

    // @relay(pattern: true)
    const isPattern =
      patternArg &&
      patternArg.kind === 'BooleanValue' &&
      patternArg.value;

    super({ ...context, isPattern }, ast);
    this.parentType = parentType;
  }

  getType(): RelayQLType {
    let type = this.ast.typeCondition;
    if (type) {
      let actualType: NamedTypeNode = type;
      // Convert `ListType` and `NonNullType` into `NamedType`.
      while (actualType.kind !== 'NamedType') {
        actualType = (actualType as any as { type: NamedTypeNode }).type;
      }
      return new RelayQLType(
        this.context,
        this.context.schema.getType(actualType.name.value),
      );
    } else if (this.ast.kind === 'InlineFragment') {
      // Inline fragments without type conditions fall back to parent type.
      if (!this.parentType) {
        throw new RelayTransformError(
          'Cannot get type of typeless inline fragment without parent type.',
          this.getLocation(),
        );
      }
      return this.parentType;
    } else {
      throw new RelayTransformError(
        util.format('Unexpected fragment kind: %s', this.ast.kind),
        this.getLocation(),
      );
    }
  }
}

// $FlowFixMe TT24544397
export class RelayQLMutation extends RelayQLDefinition<OperationDefinitionNode> {
  getType(): RelayQLType {
    return new RelayQLType(this.context, this.context.schema.getMutationType() as any);
  }
}

// $FlowFixMe TT24544397
export class RelayQLQuery extends RelayQLDefinition<OperationDefinitionNode> {
  getType(): RelayQLType {
    return new RelayQLType(this.context, this.context.schema.getQueryType());
  }
}

// $FlowFixMe TT24544397
export class RelayQLSubscription extends RelayQLDefinition<OperationDefinitionNode> {
  getType(): RelayQLType {
    return new RelayQLType(
      this.context,
      this.context.schema.getSubscriptionType() as any,
    );
  }
}

// $FlowFixMe TT24544397
export class RelayQLField extends RelayQLNode<FieldNode> {
  fieldDef: RelayQLFieldDefinition;

  constructor(
    context: RelayQLContext,
    ast: FieldNode,
    parentType: RelayQLType,
  ) {
    super(context, ast);
    const fieldName = this.ast.name.value;
    const fieldDef = parentType.getFieldDefinition(fieldName, ast);
    if (!fieldDef) {
      throw new RelayTransformError(
        util.format(
          'You supplied a field named `%s` on type `%s`, but no such field ' +
          'exists on that type.',
          fieldName,
          parentType.getName({ modifiers: false }),
        ),
        this.getLocation(),
      );
    }
    this.fieldDef = fieldDef;
  }

  getName(): string {
    return this.ast.name.value;
  }

  getAlias(): string | null {
    return this.ast.alias ? this.ast.alias.value : null;
  }

  getType(): RelayQLType {
    return this.fieldDef.getType();
  }

  hasArgument(argName: string): boolean {
    return this.getArguments().some(arg => arg.getName() === argName);
  }

  findArgument(argName: string): RelayQLArgument | undefined {
    return find(this.getArguments(), arg => arg.getName() === argName);
  }

  getArguments(): Array<RelayQLArgument> {
    const argTypes = this.fieldDef.getDeclaredArguments();
    return (this.ast.arguments || []).map(arg => {
      const argName = arg.name.value;
      const argType = argTypes[argName];
      if (!argType) {
        throw new RelayTransformError(
          util.format(
            'You supplied an argument named `%s` on field `%s`, but no such ' +
            'argument exists on that field.',
            argName,
            this.getName(),
          ),
          this.getLocation(),
        );
      }
      return new RelayQLArgument(this.context, arg, argType);
    });
  }

  hasDeclaredArgument(argName: string): boolean {
    return this.fieldDef.getDeclaredArguments().hasOwnProperty(argName);
  }

  getDeclaredArgument(argName: string): RelayQLArgumentType {
    return this.fieldDef.getArgument(argName);
  }

  getDeclaredArguments(): { [argName: string]: RelayQLArgumentType } {
    return this.fieldDef.getDeclaredArguments();
  }
}

// $FlowFixMe TT24544397
export class RelayQLFragmentSpread extends RelayQLNode<FragmentSpreadNode> {
  getName(): string {
    return this.ast.name.value;
  }

  getSelections(): Array<RelayQLSelection> {
    throw new RelayTransformError(
      'Cannot get selection of a fragment spread.',
      this.getLocation(),
    );
  }
}

// $FlowFixMe TT24544397
export class RelayQLInlineFragment extends RelayQLNode<InlineFragmentNode> {
  parentType: RelayQLType;

  constructor(
    context: RelayQLContext,
    ast: InlineFragmentNode,
    parentType: RelayQLType,
  ) {
    super(context, ast);
    this.parentType = parentType;
  }

  getFragment(): RelayQLFragment {
    return new RelayQLFragment(this.context, this.ast, this.parentType);
  }
}

export class RelayQLDirective {
  ast: DirectiveNode;
  context: RelayQLContext;
  argTypes: { [name: string]: RelayQLArgumentType };

  constructor(context: RelayQLContext, ast: DirectiveNode) {
    this.ast = ast;
    this.context = context;
    this.argTypes = {};

    const directiveName = ast.name.value;
    const schemaDirective =
      directiveName === GraphQLRelayDirective.name
        ? GraphQLRelayDirective
        : context.schema.getDirective(directiveName);
    if (!schemaDirective) {
      throw new RelayTransformError(
        util.format(
          'You supplied a directive named `%s`, but no such directive exists.',
          directiveName,
        ),
        this.getLocation(),
      );
    }
    schemaDirective.args.forEach(schemaArg => {
      this.argTypes[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
  }

  getLocation(): Location | undefined {
    return this.ast.loc;
  }

  getName(): string {
    return this.ast.name.value;
  }

  getArguments(): Array<RelayQLArgument> {
    return (this.ast.arguments || []).map(arg => {
      const argName = arg.name.value;
      const argType = this.argTypes[argName];
      if (!argType) {
        throw new RelayTransformError(
          util.format(
            'You supplied an argument named `%s` on directive `%s`, but no ' +
            'such argument exists on that directive.',
            argName,
            this.getName(),
          ),
          this.getLocation(),
        );
      }
      return new RelayQLArgument(this.context, arg, argType);
    });
  }
}

export class RelayQLArgument {
  ast: ArgumentNode;
  context: RelayQLContext;
  type: RelayQLArgumentType;

  constructor(
    context: RelayQLContext,
    ast: ArgumentNode,
    type: RelayQLArgumentType,
  ) {
    this.ast = ast;
    this.context = context;
    this.type = type;
  }

  getLocation(): Location | undefined {
    return this.ast.loc;
  }

  getName(): string {
    return this.ast.name.value;
  }

  getType(): RelayQLArgumentType {
    return this.type;
  }

  isVariable(): boolean {
    return this.ast.value.kind === 'Variable';
  }

  getVariableName(): string {
    if (this.ast.value.kind !== 'Variable') {
      throw new RelayTransformError(
        'Cannot get variable name of an argument value.',
        this.getLocation(),
      );
    }
    return this.ast.value.name.value;
  }

  getValue(): any {
    if (this.isVariable()) {
      throw new RelayTransformError(
        'Cannot get value of an argument variable.',
        this.getLocation(),
      );
    }

    const value = this.ast.value;
    if (value.kind === 'ListValue') {
      return value.values.map(
        val =>
          new RelayQLArgument(
            this.context,
            { ...this.ast, value: val },
            this.type.ofType(),
          ),
      );
    } else {
      return getLiteralValue(value);
    }
  }
}

export class RelayQLType {
  isListType: boolean;
  isNonNullType: boolean;
  context: RelayQLContext;
  schemaModifiedType: GraphQLSchemaType;
  schemaUnmodifiedType: GraphQLSchemaType;

  constructor(context: RelayQLContext, schemaModifiedType: GraphQLSchemaType) {
    this.context = context;
    const { isListType, isNonNullType, schemaUnmodifiedType } = stripMarkerTypes(
      schemaModifiedType,
    );
    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedType = schemaUnmodifiedType;
    this.schemaModifiedType = schemaModifiedType;
  }

  canHaveSubselections(): boolean {
    return !(
      this.schemaUnmodifiedType instanceof GraphQLScalarType ||
      this.schemaUnmodifiedType instanceof GraphQLEnumType
    );
  }

  getName({ modifiers }: { modifiers: boolean }): string {
    return modifiers
      ? this.schemaModifiedType.toString()
      : this.schemaUnmodifiedType.toString();
  }

  hasField(fieldName: string): boolean {
    return !!this.getFieldDefinition(fieldName);
  }

  getFieldDefinition(
    fieldName: string,
    fieldAST?: any,
  ): RelayQLFieldDefinition | null {
    const type = this.schemaUnmodifiedType;
    const isQueryType = type === this.context.schema.getQueryType();
    const hasTypeName =
      type instanceof GraphQLObjectType ||
      type instanceof GraphQLInterfaceType ||
      type instanceof GraphQLUnionType;
    const hasFields =
      type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType;

    let schemaFieldDef;
    if (isQueryType && fieldName === SchemaMetaFieldDef.name) {
      schemaFieldDef = SchemaMetaFieldDef;
    } else if (isQueryType && fieldName === TypeMetaFieldDef.name) {
      schemaFieldDef = TypeMetaFieldDef;
    } else if (hasTypeName && fieldName === TypeNameMetaFieldDef.name) {
      schemaFieldDef = TypeNameMetaFieldDef;
    } else if (hasFields) {
      schemaFieldDef = (type as any).getFields()[fieldName];
    }

    // Temporary workarounds to support legacy schemas
    if (!schemaFieldDef) {
      if (hasTypeName && fieldName === '__type__') {
        schemaFieldDef = {
          name: '__type__',
          type: new GraphQLNonNull(this.context.schema.getType('Type')),
          description: 'The introspected type of this object.',
          deprecatedReason: 'Use __typename',
          args: [],
        };
      } else if (
        isAbstractType(type as GraphQLType) &&
        fieldAST &&
        fieldAST.directives &&
        fieldAST.directives.some(
          (directive: DirectiveNode) => directive.name.value === 'fixme_fat_interface',
        )
      ) {
        const possibleTypes = this.context.schema.getPossibleTypes(type as any);
        for (let ii = 0; ii < possibleTypes.length; ii++) {
          const possibleField = possibleTypes[ii].getFields()[fieldName];
          if (possibleField) {
            // Fat interface fields can have differing arguments. Try to return
            // a field with matching arguments, but still return a field if the
            // arguments do not match.
            schemaFieldDef = possibleField;
            if (fieldAST && fieldAST.arguments) {
              const argumentsAllExist = fieldAST.arguments.every((argument: ArgumentNode) =>
                find(
                  possibleField.args,
                  argDef => argDef.name === argument.name.value,
                ),
              );
              if (argumentsAllExist) {
                break;
              }
            }
          }
        }
      }
    }

    return schemaFieldDef
      ? new RelayQLFieldDefinition(this.context, schemaFieldDef)
      : null;
  }

  getInterfaces(): Array<RelayQLType> {
    if (this.schemaUnmodifiedType instanceof GraphQLObjectType) {
      return this.schemaUnmodifiedType
        .getInterfaces()
        .map(schemaInterface => new RelayQLType(this.context, schemaInterface));
    }
    return [];
  }

  getConcreteTypes(): Array<RelayQLType> {
    if (!
      this.isAbstract()
    ) {
      throw new Error("Cannot get concrete types of a concrete type.");
    }
    return this.context.schema
      .getPossibleTypes(this.schemaUnmodifiedType as any)
      .map(concreteType => new RelayQLType(this.context, concreteType));
  }

  getIdentifyingFieldDefinition(): RelayQLFieldDefinition | null {
    if (this.alwaysImplements('Node')) {
      return this.getFieldDefinition(ID);
    }
    return null;
  }

  isAbstract(): boolean {
    return isAbstractType(this.schemaUnmodifiedType as any);
  }

  isList(): boolean {
    return this.isListType;
  }

  isNonNull(): boolean {
    return this.isNonNullType;
  }

  isQueryType(): boolean {
    return this.schemaUnmodifiedType === this.context.schema.getQueryType();
  }

  isConnection(): boolean {
    if (!/Connection$/.test(this.getName({ modifiers: false }))) {
      return false;
    }
    const edges = this.getFieldDefinition('edges');
    if (!edges || !edges.getType().canHaveSubselections()) {
      return false;
    }
    const node = edges.getType().getFieldDefinition('node');
    if (!node || !node.getType().canHaveSubselections()) {
      return false;
    }
    const cursor = edges.getType().getFieldDefinition('cursor');
    if (!cursor || cursor.getType().canHaveSubselections()) {
      return false;
    }
    return true;
  }

  isConnectionEdge(): boolean {
    return (
      /Edge$/.test(this.getName({ modifiers: false })) &&
      this.hasField('node') &&
      this.hasField('cursor')
    );
  }

  isConnectionPageInfo(): boolean {
    return this.getName({ modifiers: false }) === 'PageInfo';
  }

  alwaysImplements(typeName: string): boolean {
    return (
      this.getName({ modifiers: false }) === typeName ||
      this.getInterfaces().some(
        type => type.getName({ modifiers: false }) === typeName,
      ) ||
      (this.isAbstract() &&
        this.getConcreteTypes().every(type => type.alwaysImplements(typeName)))
    );
  }

  mayImplement(typeName: string): boolean {
    return (
      this.getName({ modifiers: false }) === typeName ||
      this.getInterfaces().some(
        type => type.getName({ modifiers: false }) === typeName,
      ) ||
      (this.isAbstract() &&
        this.getConcreteTypes().some(type => type.alwaysImplements(typeName)))
    );
  }

  generateField(fieldName: string): RelayQLField {
    const generatedFieldAST: FieldNode = {
      kind: 'Field',
      name: {
        kind: 'Name',
        value: fieldName,
      },
    };
    return new RelayQLField(this.context, generatedFieldAST, this);
  }

  generateIdFragment(): RelayQLFragment {
    const generatedFragmentAST = {
      kind: 'Fragment',
      name: {
        kind: 'Name',
        value: 'IdFragment',
      },
      typeCondition: {
        kind: 'NamedType',
        name: {
          value: 'Node',
        },
      },
      // ID field will be generated by the printer; we won't declare it here.
    };
    return new RelayQLFragment(this.context, (generatedFragmentAST as any), this);
  }
}

export class RelayQLFieldDefinition {
  context: RelayQLContext;
  schemaFieldDef: GraphQLSchemaField;

  constructor(context: RelayQLContext, schemaFieldDef: GraphQLSchemaField) {
    this.context = context;
    this.schemaFieldDef = schemaFieldDef;
  }

  getName(): string {
    return this.schemaFieldDef.name;
  }

  getType(): RelayQLType {
    return new RelayQLType(this.context, this.schemaFieldDef.type);
  }

  hasArgument(argName: string): boolean {
    return this.schemaFieldDef.args.some(
      (schemaArg: any) => schemaArg.name === argName,
    );
  }

  getArgument(argName: string): RelayQLArgumentType {
    const schemaArg = find(
      this.schemaFieldDef.args,
      (arg: any) => arg.name === argName,
    );
    if (!schemaArg) {
      throw new Error(util.format("You tried to get an argument named `%s` on field `%s`, but no such " +
        "argument exists on that field.",
        argName,
        this.getName(),
      ));
    }
    return new RelayQLArgumentType(schemaArg.type);
  }

  getDeclaredArguments(): { [argName: string]: RelayQLArgumentType } {
    const args: { [key: string]: RelayQLArgumentType } = {};
    this.schemaFieldDef.args.forEach((schemaArg: any) => {
      args[schemaArg.name] = new RelayQLArgumentType(schemaArg.type);
    });
    return args;
  }
}

export class RelayQLArgumentType {
  isListType: boolean;
  isNonNullType: boolean;
  schemaModifiedArgType: GraphQLSchemaArgumentType;
  schemaUnmodifiedArgType: GraphQLSchemaArgumentType;

  constructor(schemaModifiedArgType: GraphQLSchemaArgumentType) {
    const { isListType, isNonNullType, schemaUnmodifiedType } = stripMarkerTypes(
      schemaModifiedArgType,
    );
    this.isListType = isListType;
    this.isNonNullType = isNonNullType;
    this.schemaUnmodifiedArgType = schemaUnmodifiedType;
    this.schemaModifiedArgType = schemaModifiedArgType;
  }

  getName({ modifiers }: { modifiers: boolean }): string {
    return modifiers
      ? this.schemaModifiedArgType.toString()
      : this.schemaUnmodifiedArgType.toString();
  }

  ofType(): RelayQLArgumentType {
    if (!this.isList() && !this.isNonNull()) {
      throw new Error("Can only get type of list or non-null type.");
    }
    return new RelayQLArgumentType(this.schemaUnmodifiedArgType);
  }

  isCustomScalar(): boolean {
    return (
      this.isScalar() &&
      !(
        this.schemaUnmodifiedArgType === GraphQLBoolean ||
        this.schemaUnmodifiedArgType === GraphQLFloat ||
        this.schemaUnmodifiedArgType === GraphQLID ||
        this.schemaUnmodifiedArgType === GraphQLInt ||
        this.schemaUnmodifiedArgType === GraphQLString
      )
    );
  }

  isBoolean(): boolean {
    return this.schemaUnmodifiedArgType === GraphQLBoolean;
  }

  isEnum(): boolean {
    return this.schemaUnmodifiedArgType instanceof GraphQLEnumType;
  }

  isID(): boolean {
    return this.schemaUnmodifiedArgType === GraphQLID;
  }

  isList(): boolean {
    return this.isListType;
  }

  isNonNull(): boolean {
    return this.isNonNullType;
  }

  isNumber(): boolean {
    return (
      this.schemaUnmodifiedArgType === GraphQLFloat ||
      this.schemaUnmodifiedArgType === GraphQLInt
    );
  }

  isObject(): boolean {
    return this.schemaUnmodifiedArgType instanceof GraphQLInputObjectType;
  }

  isScalar(): boolean {
    return this.schemaUnmodifiedArgType instanceof GraphQLScalarType;
  }

  isString(): boolean {
    return this.schemaUnmodifiedArgType === GraphQLString;
  }
}

function stripMarkerTypes(
  schemaModifiedType: GraphQLSchemaType,
): {
    isListType: boolean,
    isNonNullType: boolean,
    schemaUnmodifiedType: GraphQLSchemaType,
  } {
  let isListType = false;
  let isNonNullType = false;
  let schemaUnmodifiedType = schemaModifiedType;
  while (true) {
    if (schemaUnmodifiedType instanceof GraphQLList) {
      isListType = true;
    } else if (schemaUnmodifiedType instanceof GraphQLNonNull) {
      isNonNullType = true;
    } else {
      break;
    }
    schemaUnmodifiedType = schemaUnmodifiedType.ofType;
  }
  return { isListType, isNonNullType, schemaUnmodifiedType };
}

function getLiteralValue(value: ValueNode): any {
  switch (value.kind) {
    case 'IntValue':
      return parseInt(value.value, 10);
    case 'FloatValue':
      return parseFloat(value.value);
    case 'StringValue':
    case 'BooleanValue':
    case 'EnumValue':
      return value.value;
    case 'ListValue':
      return value.values.map(getLiteralValue);
    case 'NullValue':
      return null;
    case 'ObjectValue':
      const object: { [key: string]: any } = {};
      value.fields.forEach(field => {
        object[field.name.value] = getLiteralValue(field.value);
      });
      return object;
    case 'Variable':
      throw new RelayTransformError(
        util.format(
          'Unexpected nested variable `%s`; variables are supported as top-' +
          'level arguments - `node(id: $id)` - or directly within lists - ' +
          '`nodes(ids: [$id])`.',
          value.name.value,
        ),
        value.loc,
      );
    default:
      throw new RelayTransformError(
        util.format('Unexpected value kind: %s', (value as any).kind),
        (value as any).loc,
      );
  }
}
