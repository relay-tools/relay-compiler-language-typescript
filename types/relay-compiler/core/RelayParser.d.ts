import { Parser } from 'relay-compiler/lib/GraphQLCompilerPublic';

import {
	FieldNode,
	FragmentDefinitionNode,
	OperationDefinitionNode,
	GraphQLOutputType,
	GraphQLSchema,
	GraphQLField,
} from 'graphql';

declare class RelayParser extends Parser {

	public constructor(
		schema: GraphQLSchema,
		definition: OperationDefinitionNode | FragmentDefinitionNode,
	);

	/**
	 * Find the definition of a field of the specified type.
	 */
	public getFieldDefinition(
		parentType: GraphQLOutputType,
		fieldName: string,
		fieldAST: FieldNode,
	): GraphQLField<any, any> | null;
}

declare namespace RelayParser { }

export = RelayParser;
export as namespace RelayParser;
