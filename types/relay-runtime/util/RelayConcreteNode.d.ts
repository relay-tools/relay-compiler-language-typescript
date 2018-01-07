declare class RelayConcreteNode {
	static readonly BATCH_REQUEST: 'BatchRequest';
	static readonly CONDITION: 'Condition';
	static readonly DEFERRABLE_FRAGMENT_SPREAD: 'DeferrableFragmentSpread';
	static readonly DEFERRABLE_OPERATION: 'DeferrableOperation';
	static readonly FRAGMENT: 'Fragment';
	static readonly FRAGMENT_SPREAD: 'FragmentSpread';
	static readonly INLINE_FRAGMENT: 'InlineFragment';
	static readonly LINKED_FIELD: 'LinkedField';
	static readonly LINKED_HANDLE: 'LinkedHandle';
	static readonly LITERAL: 'Literal';
	static readonly LOCAL_ARGUMENT: 'LocalArgument';
	static readonly OPERATION: 'Operation';
	static readonly ROOT_ARGUMENT: 'RootArgument';
	static readonly REQUEST: 'Request';
	static readonly SCALAR_FIELD: 'ScalarField';
	static readonly SCALAR_HANDLE: 'ScalarHandle';
	static readonly VARIABLE: 'Variable';

	private constructor();
}

declare namespace RelayConcreteNode {
	export type ConcreteArgument = ConcreteLiteral | ConcreteVariable;
	export type ConcreteArgumentDefinition =
		| ConcreteLocalArgument
		| ConcreteRootArgument;
	/**
	 * An experimental wrapper around many operations to request in a batched
	 * network request. The composed indivual GraphQL requests should be submitted
	 * as a single networked request, e.g. in the case of deferred nodes or
	 * for streaming connections that are represented as distinct compiled concrete
	 * operations but are still conceptually tied to one source operation.
	 *
	 * Individual requests within the batch may contain data describing their
	 * dependencies on other requests or themselves.
	 */
	export type ConcreteBatchRequest = {
		kind: 'BatchRequest',
		operationKind: 'mutation' | 'query' | 'subscription',
		name: string,
		metadata: { [key: string]: any },
		fragment: ConcreteFragment,
		requests: Array<{
			name: string,
			id: string | null,
			text: string | null,
			// Arguments in the provided operation to be derived via the results of
			// other requests in this batch.
			argumentDependencies: Array<ArgumentDependency> | null,
			operation: ConcreteOperation | ConcreteDeferrableOperation,
		}>,
	};
	/**
	 * Argument in the provided operation to be derived via the results of
	 * other requests in the batch.
	 */
	export type ArgumentDependency = {
		// The name of the argument to provide.
		name: string,
		// The name of the request in this batch to wait for a result from.
		// This may be the same request for recursive requests (in which case
		// the initial value will be null).
		fromRequestName: string,
		// The JSONPath into the dependent request at which the value for this
		// argument is found.
		fromRequestPath?: string,
		// Exported variable from the query this depends on. Should only use one of
		// fromRequestImport or fromRequestPath
		fromRequestImport?: string,
		// If the result is a list of values, should it use the first value, last
		// value, all values in the list, or trigger a new instance of this
		// request for each item in the list.
		ifList?: 'first' | 'last' | 'all' | 'each',
		// If the result is null, should it result in an error, allow the null
		// value to be provided, or skip execution of this request.
		ifNull?: 'error' | 'allow' | 'skip',
		// If this argument is dependent on itself, how many times may this
		// request execute before completing.
		maxRecurse?: number,
	};
	/**
	 * Represents a common GraphQL request with `text` (or persisted `id`) can be
	 * used to execute it, an `operation` containing information to normalize the
	 * results, and a `fragment` derived from that operation to read the response
	 * data (masking data from child fragments).
	 */
	export type ConcreteRequest = {
		kind: 'Request',
		operationKind: 'mutation' | 'query' | 'subscription',
		name: string,
		id: string | null,
		text: string | null,
		metadata: { [key: string]: any },
		fragment: ConcreteFragment,
		operation: ConcreteNonDeferrableOperation,
	};
	/**
	 * Represents a single operation used to processing and normalize runtime
	 * request results.
	 */
	export type ConcreteOperation =
		| ConcreteNonDeferrableOperation
		| ConcreteDeferrableOperation;
	type ConcreteNonDeferrableOperation = {
		kind: 'Operation',
		name: string,
		argumentDefinitions: Array<ConcreteLocalArgument>,
		selections: Array<ConcreteSelection>,
	};
	type ConcreteDeferrableOperation = {
		kind: 'DeferrableOperation',
		name: string,
		argumentDefinitions: Array<ConcreteLocalArgument>,
		selections: Array<ConcreteSelection>,
		fragmentName: string,
		rootFieldVariable: string,
	};
	export type ConcreteCondition = {
		kind: 'Condition',
		passingValue: boolean,
		condition: string,
		selections: Array<ConcreteSelection>,
	};
	export type ConcreteField = ConcreteScalarField | ConcreteLinkedField;
	export type ConcreteFragment = {
		kind: 'Fragment',
		name: string,
		type: string,
		metadata: { [key: string]: any } | null,
		argumentDefinitions: Array<ConcreteArgumentDefinition>,
		selections: Array<ConcreteSelection>,
	};
	export type ConcreteFragmentSpread = {
		kind: 'FragmentSpread',
		name: string,
		args: Array<ConcreteArgument> | null,
	};
	export type ConcreteDeferrableFragmentSpread = {
		kind: 'DeferrableFragmentSpread',
		name: string,
		args: Array<ConcreteArgument> | null,
		rootFieldVariable: string,
		storageKey: string,
	};
	export type ConcreteHandle = ConcreteScalarHandle | ConcreteLinkedHandle;
	export type ConcreteRootArgument = {
		kind: 'RootArgument',
		name: string,
		type: string | null,
	};
	export type ConcreteInlineFragment = {
		kind: 'InlineFragment',
		selections: Array<ConcreteSelection>,
		type: string,
	};
	export type ConcreteLinkedField = {
		kind: 'LinkedField',
		alias: string | null,
		name: string,
		storageKey: string | null,
		args: Array<ConcreteArgument> | null,
		concreteType: string | null,
		plural: boolean,
		selections: Array<ConcreteSelection>,
	};
	export type ConcreteLinkedHandle = {
		kind: 'LinkedHandle',
		alias: string | null,
		name: string,
		args: Array<ConcreteArgument> | null,
		handle: string,
		key: string,
		filters: Array<string> | null,
	};
	export type ConcreteLiteral = {
		kind: 'Literal',
		name: string,
		type: string | null,
		value: any,
	};
	export type ConcreteLocalArgument = {
		kind: 'LocalArgument',
		name: string,
		type: string,
		defaultValue: any,
	};
	export type ConcreteNode =
		| ConcreteCondition
		| ConcreteLinkedField
		| ConcreteFragment
		| ConcreteInlineFragment
		| ConcreteOperation
		| ConcreteDeferrableOperation;
	export type ConcreteScalarField = {
		kind: 'ScalarField',
		alias: string | null,
		name: string,
		args: Array<ConcreteArgument> | null,
		storageKey: string | null,
	};
	export type ConcreteScalarHandle = {
		kind: 'ScalarHandle',
		alias: string | null,
		name: string,
		args: Array<ConcreteArgument> | null,
		handle: string,
		key: string,
		filters: Array<string> | null,
	};
	export type ConcreteSelection =
		| ConcreteCondition
		| ConcreteDeferrableFragmentSpread
		| ConcreteField
		| ConcreteFragmentSpread
		| ConcreteHandle
		| ConcreteInlineFragment;
	export type ConcreteVariable = {
		kind: 'Variable',
		name: string,
		type: string | null,
		variableName: string,
	};
	export type ConcreteSelectableNode =
		| ConcreteFragment
		| ConcreteOperation
		| ConcreteDeferrableOperation;
	export type RequestNode = ConcreteRequest | ConcreteBatchRequest;
	export type GeneratedNode = RequestNode | ConcreteFragment;
}

export = RelayConcreteNode;
export as namespace RelayConcreteNode;
