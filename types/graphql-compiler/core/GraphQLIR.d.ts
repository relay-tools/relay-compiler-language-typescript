import {
	GraphQLCompositeType,
	GraphQLOutputType,
	GraphQLInputType,
	GraphQLLeafType,
	GraphQLList,
	GraphQLNonNull,
} from 'graphql';

export interface Argument {
	kind: 'Argument';
	metadata: { [key: string]: any };
	name: string;
	type: GraphQLInputType | null;
	value: ArgumentValue;
}

export type ArgumentDefinition = LocalArgumentDefinition | RootArgumentDefinition;

export interface ArgumentDependency {
	argumentName: string;
	fromName: string;
	fromPath: string;
	ifList?: 'first' | 'last' | 'all' | 'each';
	ifNull?: 'error' | 'allow' | 'skip';
	kind: 'ArgumentDependency';
	maxRecurse?: number;
}

export type ArgumentValue = ListValue | Literal | ObjectValue | Variable;

export interface Batch {
	kind: 'Batch';
	fragment: Fragment;
	metadata: { [key: string]: any };
	name: string;
	requests: Array<Request>;
}

export type Condition = {
	kind: 'Condition';
	condition: Literal | Variable;
	metadata: { [key: string]: any } | null;
	passingValue: boolean;
	selections: Array<Selection>;
};
export type DependentRequest = {
	operationName: string;
	argumentDependencies: Array<ArgumentDependency>;
};
export type Directive = {
	args: Array<Argument>;
	kind: 'Directive';
	metadata: { [key: string]: any } | null;
	name: string;
};
export type Field = LinkedField | ScalarField;
export type Fragment = {
	argumentDefinitions: Array<ArgumentDefinition>;
	directives: Array<Directive>;
	kind: 'Fragment';
	metadata: { [key: string]: any } | null;
	name: string;
	selections: Array<Selection>;
	type: GraphQLCompositeType;
};
export type FragmentSpread = {
	args: Array<Argument>;
	directives: Array<Directive>;
	kind: 'FragmentSpread';
	metadata: { [key: string]: any } | null;
	name: string;
};
export type IR =
	| Argument
	| Batch
	| Condition
	| Directive
	| Fragment
	| FragmentSpread
	| InlineFragment
	| LinkedField
	| ListValue
	| Literal
	| LocalArgumentDefinition
	| ObjectFieldValue
	| ObjectValue
	| Request
	| Root
	| RootArgumentDefinition
	| ScalarField
	| Variable;
export type RootArgumentDefinition = {
	kind: 'RootArgumentDefinition';
	metadata: { [key: string]: any } | null;
	name: string;
	type: GraphQLInputType;
};
export type InlineFragment = {
	directives: Array<Directive>;
	kind: 'InlineFragment';
	metadata: { [key: string]: any } | null;
	selections: Array<Selection>;
	typeCondition: GraphQLCompositeType;
};
export type Handle = {
	name: string;
	key: string;
	filters: Array<string> | null;
};
export type LinkedField = {
	alias: string | null;
	args: Array<Argument>;
	directives: Array<Directive>;
	handles: Array<Handle> | null;
	kind: 'LinkedField';
	metadata: { [key: string]: any } | null;
	name: string;
	selections: Array<Selection>;
	type: GraphQLOutputType;
};
export type ListValue = {
	kind: 'ListValue';
	items: Array<ArgumentValue>;
	metadata: { [key: string]: any } | null;
};
export type Literal = {
	kind: 'Literal';
	metadata: { [key: string]: any } | null;
	value: any;
};
export type LocalArgumentDefinition = {
	defaultValue: any;
	kind: 'LocalArgumentDefinition';
	metadata: { [key: string]: any } | null;
	name: string;
	type: GraphQLInputType;
};
export type Node = Condition | Fragment | InlineFragment | LinkedField | Root;
export type ObjectFieldValue = {
	kind: 'ObjectFieldValue';
	metadata: { [key: string]: any } | null;
	name: string;
	value: ArgumentValue;
};
export type ObjectValue = {
	kind: 'ObjectValue';
	fields: Array<ObjectFieldValue>;
	metadata: { [key: string]: any } | null;
};
export type Request = {
	kind: 'Request';
	argumentDependencies: Array<ArgumentDependency>;
	id: string | null;
	name: string;
	root: Root;
	text: string | null;
};
export type Root = {
	argumentDefinitions: Array<LocalArgumentDefinition>;
	directives: Array<Directive>;
	dependentRequests: Array<DependentRequest>;
	kind: 'Root';
	metadata: { [key: string]: any } | null;
	name: string;
	operation: 'query' | 'mutation' | 'subscription';
	selections: Array<Selection>;
	type: GraphQLCompositeType;
};
export type ScalarFieldType = GraphQLLeafType | GraphQLList<any> | GraphQLNonNull<GraphQLLeafType | GraphQLList<any>>;
export type ScalarField = {
	alias: string | null;
	args: Array<Argument>;
	directives: Array<Directive>;
	handles: Array<Handle> | null;
	kind: 'ScalarField';
	metadata: { [key: string]: any } | null;
	name: string;
	type: ScalarFieldType;
};
export type Selection = Condition | FragmentSpread | InlineFragment | LinkedField | ScalarField;
export interface Variable {
	kind: 'Variable';
	metadata: { [key: string]: any } | null;
	variableName: string;
	type: GraphQLInputType | null;
}
