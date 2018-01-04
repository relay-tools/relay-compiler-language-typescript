import { isOperationDefinitionAST, isSchemaDefinitionAST } from './GraphQLSchemaUtils';
import { extendSchema, parse, visit } from 'graphql';

import { Fragment, Root } from './GraphQLIR';
import {
	DefinitionNode,
	DocumentNode,
	FragmentDefinitionNode,
	FragmentSpreadNode,
	GraphQLSchema,
	OperationDefinitionNode,
} from 'graphql';

type ASTDefinitionNode = FragmentDefinitionNode | OperationDefinitionNode;
type TransformFn = (schema: GraphQLSchema, definition: ASTDefinitionNode) => Root | Fragment;

export function convertASTDocuments(
	schema: GraphQLSchema,
	documents: Array<DocumentNode>,
	validationRules: Array<Function>,
	transform: TransformFn,
): Array<Fragment | Root>;

export function convertASTDocumentsWithBase(
	schema: GraphQLSchema,
	baseDocuments: Array<DocumentNode>,
	documents: Array<DocumentNode>,
	validationRules: Array<Function>,
	transform: TransformFn,
): Array<Fragment | Root>;

export function transformASTSchema(schema: GraphQLSchema, schemaExtensions: Array<string>): GraphQLSchema;

export function extendASTSchema(baseSchema: GraphQLSchema, documents: Array<DocumentNode>): GraphQLSchema;
