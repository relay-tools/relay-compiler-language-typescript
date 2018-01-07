import {
	Argument,
	ArgumentDefinition,
	ArgumentValue,
	Condition,
	Directive,
	Field,
	Fragment,
	FragmentSpread,
	Handle,
	InlineFragment,
	LocalArgumentDefinition,
	Root,
	ScalarFieldType,
	Selection,
	Variable,
} from './GraphQLIR';
import {
	ArgumentNode,
	DirectiveNode,
	FieldNode,
	FragmentDefinitionNode,
	FragmentSpreadNode,
	InlineFragmentNode,
	OperationDefinitionNode,
	SelectionSetNode,
	ValueNode,
	VariableDefinitionNode,
	VariableNode,
	GraphQLInputType,
	GraphQLOutputType,
	GraphQLSchema,
	GraphQLArgument,
	GraphQLField,
} from 'graphql';

declare class GraphQLParser {

	public static parse(
		schema: GraphQLSchema,
		text: string,
		filename?: string,
	): Array<Root | Fragment>;

	/**
	 * Transforms a raw GraphQL AST into a simpler representation with type
	 * information.
	 */
	public static transform(
		schema: GraphQLSchema,
		definition: OperationDefinitionNode | FragmentDefinitionNode,
	): Root | Fragment;

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

	public transform(): Root | Fragment;
}

declare namespace GraphQLParser { }
export = GraphQLParser;
export as namespace GraphQLParser;
