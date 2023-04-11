import { RelayQLPrinter } from './RelayQLPrinter';

import * as util from 'util';
import * as path from 'path';
import * as ts from 'typescript';

import { RelayQLFragment, RelayQLMutation, RelayQLQuery, RelayQLSubscription, RelayQLNodeType } from './RelayQLAST';
import {
	formatError,
	parse,
	Source,
	validate,
	FieldsOnCorrectTypeRule,
	FragmentsOnCompositeTypesRule,
	KnownArgumentNamesRule,
	KnownTypeNamesRule,
	PossibleFragmentSpreadsRule,
	VariablesInAllowedPositionRule,
} from 'graphql';
import * as gql from 'graphql';

const ValuesOfCorrectTypeRule: typeof PossibleFragmentSpreadsRule = (gql as any).ValuesOfCorrectTypeRule;

import { RelayQLDefinition } from './RelayQLAST';
import { Printable, Substitution } from './RelayQLPrinter';
import { DocumentNode, GraphQLError, GraphQLFormattedError, GraphQLSchema } from 'graphql';

export type Validator<T> = () => {
	validate: (schema: GraphQLSchema, ast: T) => Array<GraphQLError>;
};

type TransformerOptions = {
	inputArgumentName: string | null;
	snakeCase: boolean;
	substituteVariables: boolean;
	validator: Validator<any> | null;
};
type TextTransformOptions = {
	documentName: string;
	enableValidation: boolean;
	propName: string | null;
	tagName: string;
};

function sanitizeDocumentName(str: string): string {
	const basename = path.basename(str.replace(/-/g, '_'));
	const firstDot = basename.indexOf('.');
	if (firstDot < 0) {
		return basename;
	}
	return basename.substr(0, firstDot);
}

/**
 * Transforms a TemplateLiteral node into a RelayQLDefinition, which is then
 * transformed into a TS AST via RelayQLPrinter.
 */
export class RelayQLTransformer {
	schema: GraphQLSchema;
	options: TransformerOptions;

	constructor(schema: GraphQLSchema, options: TransformerOptions) {
		this.schema = schema;
		this.options = options;
	}

	transform(node: ts.TaggedTemplateExpression, options: TextTransformOptions): Printable {
		const documentName = sanitizeDocumentName(options.documentName);
		const opts = {
			documentName,
			propName: options.propName,
			enableValidation: options.enableValidation,
			tagName: options.tagName,
		};
		const { substitutions, templateText, variableNames } = this.processTemplateLiteral(node, documentName);
		const documentText = this.processTemplateText(templateText, opts);
		const definition = this.processDocumentText(documentText, opts);

		const Printer = RelayQLPrinter(this.options);
		return new Printer(options.tagName, variableNames).print(definition, substitutions, options.enableValidation);
	}

	/**
	 * Convert TemplateLiteral into a single template string with substitution
	 * names, a matching array of substituted values, and a set of substituted
	 * variable names.
	 */
	processTemplateLiteral(
		node: ts.TaggedTemplateExpression,
		documentName: string,
	): {
		substitutions: Array<Substitution>;
		templateText: string;
		variableNames: { [variableName: string]: void };
	} {
		const chunks: string[] = [];
		const variableNames: { [key: string]: undefined } = {};
		const substitutions: Substitution[] = [];
		const template = node.template;
		if (ts.isNoSubstitutionTemplateLiteral(template)) {
			return {
				substitutions,
				templateText: template.text,
				variableNames,
			};
		}
		chunks.push(template.head.text);
		let previousChunk = template.head.text;
		template.templateSpans.forEach((element, ii) => {
			const literal = element.literal;
			const chunk = literal.text;
			const name = 'RQL_' + ii;
			const value = element.expression;
			substitutions.push({ name, value });
			if (/:\s*$/.test(previousChunk)) {
				if (!this.options.substituteVariables) {
					throw new Error(
						util.format(
							'You supplied a GraphQL document named `%s` that uses template ' +
								'substitution for an argument value, but variable substitution ' +
								'has not been enabled.',
							documentName,
						),
					);
				}
				chunks.push('$' + name);
				variableNames[name] = undefined;
			} else {
				chunks.push('...' + name);
			}
			chunks.push(chunk);
			previousChunk = chunk;
		});
		return { substitutions, templateText: chunks.join('').trim(), variableNames };
	}

	/**
	 * Converts the template string into a valid GraphQL document string.
	 */
	processTemplateText(templateText: string, { documentName, propName }: TextTransformOptions): string {
		const pattern = /^[\s\n]*(fragment|mutation|query|subscription)\s*(\w*)?([\s\S]*)/;
		const matches = pattern.exec(templateText);
		if (!matches) {
			throw new Error(
				util.format(
					'You supplied a GraphQL document named `%s` with invalid syntax. It ' +
						'must start with `fragment`, `mutation`, `query`, or `subscription`.',
					documentName,
				),
			);
		}
		const type = matches[1];
		let name = matches[2] || documentName;
		let rest = matches[3];
		// Allow `fragment on Type {...}`.
		if (type === 'fragment' && name === 'on') {
			name = documentName + (propName ? '_' + capitalize(propName) : '') + 'RelayQL';
			rest = 'on' + rest;
		}
		const definitionName = capitalize(name);
		return type + ' ' + definitionName + ' ' + rest;
	}

	/**
	 * Parses the GraphQL document string into a RelayQLDocument.
	 */
	processDocumentText(
		documentText: string,
		{ documentName, enableValidation }: TextTransformOptions,
	): RelayQLDefinition<any> {
		const document = parse(new Source(documentText, documentName));
		const validationErrors = enableValidation ? this.validateDocument(document, documentName) : null;
		if (validationErrors) {
			const error = new Error(
				util.format('You supplied a GraphQL document named `%s` with validation errors.', documentName),
			);
			(error as any).validationErrors = validationErrors;
			(error as any).sourceText = documentText;
			throw error;
		}
		const definition = document.definitions[0];

		const context = {
			definitionName: capitalize(documentName),
			isPattern: false,
			generateID: createIDGenerator(),
			schema: this.schema,
		};
		if (definition.kind === 'FragmentDefinition') {
			return new RelayQLFragment(context, definition as RelayQLNodeType<gql.FragmentDefinitionNode>);
		} else if (definition.kind === 'OperationDefinition') {
			if (definition.operation === 'mutation') {
				return new RelayQLMutation(context, definition as RelayQLNodeType<gql.OperationDefinitionNode>);
			} else if (definition.operation === 'query') {
				return new RelayQLQuery(context, definition as RelayQLNodeType<gql.OperationDefinitionNode>);
			} else if (definition.operation === 'subscription') {
				return new RelayQLSubscription(context, definition as RelayQLNodeType<gql.OperationDefinitionNode>);
			} else {
				throw new Error(util.format('Unsupported operation: %s', definition.operation));
			}
		} else {
			throw new Error(util.format('Unsupported definition: %s', definition.kind));
		}
	}

	validateDocument(document: DocumentNode, documentName: string): Array<GraphQLFormattedError> | null {
		if (document.definitions.length !== 1) {
			throw new Error(
				util.format(
					'You supplied a GraphQL document named `%s` with %d definitions, but ' +
						'it must have exactly one definition.',
					documentName,
					document.definitions.length,
				),
			);
		}

		const validator = this.options.validator;
		let validationErrors;
		if (validator) {
			validationErrors = validator().validate(this.schema, document);
		} else {
			const rules = [
				FieldsOnCorrectTypeRule,
				FragmentsOnCompositeTypesRule,
				KnownArgumentNamesRule,
				KnownTypeNamesRule,
				PossibleFragmentSpreadsRule,
				ValuesOfCorrectTypeRule,
				VariablesInAllowedPositionRule,
			];
			validationErrors = validate(this.schema, document, rules);
		}

		if (validationErrors && validationErrors.length > 0) {
			return validationErrors.map(formatError);
		}
		return null;
	}
}

function capitalize(string: string): string {
	return string[0].toUpperCase() + string.slice(1);
}

/**
 * Utility to generate locally scoped auto-incrementing IDs.
 */
function createIDGenerator(): () => string {
	let _id = 0;
	return () => (_id++).toString(32);
}
