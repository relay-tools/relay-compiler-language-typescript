import * as ts from 'typescript';
import { DocumentNode, parse } from 'graphql';

export function getValidGraphQLTag(node: ts.TaggedTemplateExpression): DocumentNode | null {
	if (!isGraphQLTag(node)) {
		return null;
	}

	if (!ts.isNoSubstitutionTemplateLiteral(node.template)) {
		throw new Error("TSTransformerRelay: Substitutions are not allowed in graphql fragments. " +
			"Included fragments should be referenced as `...MyModule_propName`.",
		);
	}

	const text = node.template.text;

	const ast = parse(text);

	if (ast.definitions.length === 0) {
		throw new Error("TSTransformerRelay: Unexpected empty graphql tag.");
	}

	return ast;
}

function isGraphQLTag(node: ts.TaggedTemplateExpression): boolean {
	const tag = node.tag;

	if (!ts.isIdentifier(tag)) {
		return false;
	}

	if (tag.text !== 'graphql') {
		return false;
	}

	return true;
}
