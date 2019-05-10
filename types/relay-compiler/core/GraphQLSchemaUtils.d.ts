import {
  assertAbstractType,
  ASTNode,
  DirectiveDefinitionNode,
  EnumTypeDefinitionNode,
  FragmentDefinitionNode,
  getNamedType,
  getNullableType,
  GraphQLCompositeType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLType,
  GraphQLUnionType,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  isType,
  ObjectTypeDefinitionNode,
  OperationDefinitionNode,
  print,
  ScalarTypeDefinitionNode,
  SchemaDefinitionNode,
  typeFromAST,
  TypeNode,
  UnionTypeDefinitionNode
} from "graphql";

type GraphQLSingularType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLInputObjectType
  | GraphQLNonNull<
      | GraphQLScalarType
      | GraphQLObjectType
      | GraphQLInterfaceType
      | GraphQLUnionType
      | GraphQLEnumType
      | GraphQLInputObjectType
    >;

/**
 * Determine if the given type may implement the named type:
 * - it is the named type
 * - it implements the named interface
 * - it is an abstract type and *some* of its concrete types may
 *   implement the named type
 */
export function mayImplement(
  schema: GraphQLSchema,
  type: GraphQLType,
  typeName: string
): boolean;

export function canHaveSelections(type: GraphQLType): boolean;

/**
 * Implements duck typing that checks whether a type has an id field of the ID
 * type. This is approximating what we can hopefully do with the __id proposal
 * a bit more cleanly.
 *
 * https://github.com/graphql/graphql-future/blob/master/01%20-%20__id.md
 */
export function hasID(
  schema: GraphQLSchema,
  type: GraphQLCompositeType
): boolean;

/**
 * Determine if a type is abstract (not concrete).
 *
 * Note: This is used in place of the `graphql` version of the function in order
 * to not break `instanceof` checks with Jest. This version also unwraps
 * non-null/list wrapper types.
 */
export function isAbstractType(type: GraphQLType): boolean;

export function isUnionType(type: GraphQLType): type is GraphQLUnionType;

/**
 * Get the unmodified type, with list/null wrappers removed.
 */
export function getRawType(type: GraphQLType): GraphQLNamedType;

/**
 * Gets the non-list type, removing the list wrapper if present.
 */
export function getSingularType(type: GraphQLType): GraphQLSingularType;

/**
 * @public
 */
export function implementsInterface(
  type: GraphQLType,
  interfaceName: string
): boolean;

/**
 * @public
 *
 * Determine if an AST node contains a fragment/operation definition.
 */
export function isOperationDefinitionAST(
  ast: ASTNode
): ast is FragmentDefinitionNode | OperationDefinitionNode;

/**
 * @public
 *
 * Determine if an AST node contains a schema definition.
 */
export function isSchemaDefinitionAST(
  ast: ASTNode
): ast is
  | SchemaDefinitionNode
  | ScalarTypeDefinitionNode
  | ObjectTypeDefinitionNode
  | InterfaceTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | DirectiveDefinitionNode;
// GraphQL type package is missing these, but they are checked
// | ScalarTypeExtensionNode
// | ObjectTypeExtensionNode
// | InterfaceTypeExtensionNode
// | UnionTypeExtensionNode
// | EnumTypeExtensionNode
// | InputObjectTypeExtensionNode;

export function assertTypeWithFields(
  type: GraphQLType | null | undefined
): GraphQLObjectType | GraphQLInterfaceType;

/**
 * Helper for calling `typeFromAST()` with a clear warning when the type does
 * not exist. This enables the pattern `assertXXXType(getTypeFromAST(...))`,
 * emitting distinct errors for unknown types vs types of the wrong category.
 */
export function getTypeFromAST(
  schema: GraphQLSchema,
  ast: TypeNode
): GraphQLType;

export { getNullableType } from "graphql";
