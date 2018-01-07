import { CompilerCache } from '../util/CompilerCache';

import * as ts from 'typescript';
import { getModuleName } from '../util/getModuleName';
import { Source, parse } from '../util/graphql';
import * as path from 'path';
import * as util from 'util';

import { File } from 'relay-compiler/lib/GraphQLCompilerPublic';
import { callbackify } from 'util';
import { isPropertyAccessOrQualifiedName } from 'typescript';

interface Options {
	validateNames: boolean;
};

interface Location {
	line: number;
	column: number;
}

function isCreateContainerFunction(fnName: string): fnName is 'createFragmentContainer' | 'createRefetchContainer' | 'createPaginationContainer' {
	return fnName === 'createFragmentContainer' || fnName === 'createRefetchContainer' || fnName === 'createPaginationContainer';
}

function isCreateContainerCall(callExpr: ts.CallExpression): boolean {
	const callee = callExpr.expression;
	return (ts.isIdentifier(callee) && isCreateContainerFunction(callee.text)) || (
		ts.isPropertyAccessExpression(callee) &&
		ts.isIdentifier(callee.expression) &&
		callee.expression.text === 'Relay' &&
		isCreateContainerFunction(callee.name.text)
	);
}

function createContainerName(callExpr: ts.CallExpression): 'createFragmentContainer' | 'createRefetchContainer' | 'createPaginationContainer' {
	if (ts.isIdentifier(callExpr.expression) && isCreateContainerFunction(callExpr.expression.text)) {
		return callExpr.expression.text;
	}
	if (ts.isPropertyAccessExpression(callExpr.expression) && ts.isIdentifier(callExpr.expression.expression) && callExpr.expression.expression.text === 'Relay') {
		if (isCreateContainerFunction(callExpr.expression.name.text)) {
			return callExpr.expression.name.text;
		}
	}
	throw new Error('Not a relay create container call');
}

function validateTemplate(template: string, moduleName: string, keyName: string | null, filePath: string, loc: Location) {
	const ast = parse(new (Source as any)(template, filePath, loc) as Source);
	ast.definitions.forEach((def: any) => {
		invariant(
			def.name,
			'FindGraphQLTags: In module `%s`, a definition of kind `%s` requires a name.',
			moduleName,
			def.kind,
		);
		const definitionName = def.name.value;
		if (def.kind === 'OperationDefinition') {
			const operationNameParts = definitionName.match(
				/^(.*)(Mutation|Query|Subscription)$/,
			);
			invariant(
				operationNameParts && definitionName.startsWith(moduleName),
				'FindGraphQLTags: Operation names in graphql tags must be prefixed ' +
				'with the module name and end in "Mutation", "Query", or ' +
				'"Subscription". Got `%s` in module `%s`.',
				definitionName,
				moduleName,
			);
		} else if (def.kind === 'FragmentDefinition') {
			if (keyName) {
				invariant(
					definitionName === moduleName + '_' + keyName,
					'FindGraphQLTags: Container fragment names must be ' +
					'`<ModuleName>_<propName>`. Got `%s`, expected `%s`.',
					definitionName,
					moduleName + '_' + keyName,
				);
			} else {
				invariant(
					definitionName.startsWith(moduleName),
					'FindGraphQLTags: Fragment names in graphql tags must be prefixed ' +
					'with the module name. Got `%s` in module `%s`.',
					definitionName,
					moduleName,
				);
			}
		}
	});
}


function visit(node: ts.Node, addGraphQLText: (text: string) => void, options: Options, moduleName: string, filePath: string): void {
	function visitNode(node: ts.Node) {
		switch (node.kind) {
			case ts.SyntaxKind.CallExpression: {
				const callExpr = node as ts.CallExpression;
				if (isCreateContainerCall(callExpr)) {
					const fragmentSpec = callExpr.arguments[1];
					if (fragmentSpec == null) {
						break;
					}
					if (ts.isObjectLiteralExpression(fragmentSpec)) {
						fragmentSpec.properties.forEach((prop) => {
							invariant(
								ts.isPropertyAssignment(prop) &&
								prop.questionToken == null &&
								ts.isIdentifier(prop.name) &&
								ts.isTaggedTemplateExpression(prop.initializer),
								'FindGraphQLTags: `%s` expects fragment definitions to be ' +
								'`key: graphql`.',
								createContainerName(callExpr),
							);

							// We tested for this
							const propAssignment = prop as ts.PropertyAssignment;
							const keyName = (propAssignment.name as ts.Identifier).text;

							const taggedTemplate = propAssignment.initializer as ts.TaggedTemplateExpression;
							invariant(
								isGraphQLTag(taggedTemplate.tag),
								'FindGraphQLTags: `%s` expects fragment definitions to be tagged ' +
								'with `graphql`, got `%s`.',
								createContainerName(callExpr),
								taggedTemplate.tag.getText(),
							);
							const template = getGraphQLText(taggedTemplate);
							if (options.validateNames) {
								validateTemplate(
									template,
									moduleName,
									keyName,
									filePath,
									getSourceLocationOffset(taggedTemplate),
								);
							}
							addGraphQLText(template);
						});
					} else {
						invariant(
							ts.isTaggedTemplateExpression(fragmentSpec),
							'FindGraphQLTags: `%s` expects a second argument of fragment ' +
							'definitions.',
							createContainerName(callExpr),
						);
						const taggedTemplate = fragmentSpec as ts.TaggedTemplateExpression;
						invariant(
							isGraphQLTag(taggedTemplate.tag),
							'FindGraphQLTags: `%s` expects fragment definitions to be tagged ' +
							'with `graphql`, got `%s`.',
							createContainerName(callExpr),
							taggedTemplate.tag.getText(),
						);
						const template = getGraphQLText(taggedTemplate);
						if (options.validateNames) {
							validateTemplate(
								template,
								moduleName,
								null,
								filePath,
								getSourceLocationOffset(taggedTemplate),
							);
						}
						addGraphQLText(template);
					}
					// Visit remaining arguments
					for (let i = 2; i < callExpr.arguments.length; i++) {
						visit(callExpr.arguments[i], addGraphQLText, options, moduleName, filePath);
					}
					return;
				}
				break;
			}
			case ts.SyntaxKind.TaggedTemplateExpression: {
				const taggedTemplate = node as ts.TaggedTemplateExpression;
				if (isGraphQLTag(taggedTemplate.tag)) {
					const template = getGraphQLText(taggedTemplate);
					addGraphQLText(template);
				}
			}
		}
		ts.forEachChild(node, visitNode);
	}

	visitNode(node);
}

function findTags(
	text: string,
	filePath: string,
	options: Options,
): string[] {
	const result: string[] = [];
	const ast = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
	const moduleName = getModuleName(filePath);

	visit(ast, (text) => result.push(text), options, moduleName, filePath);
	return result;
}

const cache = new CompilerCache<string[]>('FindGraphQLTags', 'v1');

export function memoizedFind(
	text: string,
	baseDir: string,
	file: File,
	options: Options,
): string[] {
	return cache.getOrCompute(
		file.hash,
		() => {
			const absPath = path.join(baseDir, file.relPath);
			return find(text, absPath, options);
		},
	);
}

function isGraphQLTag(tag: ts.Node): boolean {
	return tag.kind === ts.SyntaxKind.Identifier && (tag as ts.Identifier).text === 'graphql';
}

function getTemplateNode(quasi: ts.TaggedTemplateExpression): ts.NoSubstitutionTemplateLiteral {
	invariant(quasi.template.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral, 'FindGraphQLTags: Substitutions are not allowed in graphql tags.');
	return quasi.template as ts.NoSubstitutionTemplateLiteral;
}

function getGraphQLText(quasi: ts.TaggedTemplateExpression) {
	return getTemplateNode(quasi).text;
}

function getSourceLocationOffset(quasi: ts.TaggedTemplateExpression) {
	const pos = getTemplateNode(quasi).pos;
	const loc = quasi.getSourceFile().getLineAndCharacterOfPosition(pos);
	return {
		line: loc.line + 1,
		column: loc.character + 1,
	};
}

function invariant(condition: boolean, msg: string, ...args: any[]) {
	if (!condition) {
		throw new Error(util.format(msg, ...args));
	}
}

export const find = findTags;
