/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayJSModuleParser
 * @flow
 * @format
 */

'use strict';

import * as FindGraphQLTags from '../codegen/FindGraphQLTags';
import * as GraphQL from 'graphql';

import * as fs from 'fs';
import * as invariant from 'invariant';
import * as path from 'path';

import { File, FileFilter, ASTCache } from 'relay-compiler/lib/GraphQLCompilerPublic';
import { DocumentNode, DefinitionNode } from 'graphql';

const parseGraphQL = GraphQL.parse;

const FIND_OPTIONS = {
	validateNames: true,
};

// Throws an error if parsing the file fails
function parseFile(baseDir: string, file: File): DocumentNode {
	const text = fs.readFileSync(path.join(baseDir, file.relPath), 'utf8');

	invariant(
		text.indexOf('graphql') >= 0,
		'RelayJSModuleParser: Files should be filtered before passed to the ' +
		'parser, got unfiltered file `%s`.',
		file,
	);

	const astDefinitions: DefinitionNode[] = [];
	FindGraphQLTags.memoizedFind(text, baseDir, file, { validateNames: true }).forEach(
		(template: string) => {
			const ast = parseGraphQL(new GraphQL.Source(template, file.relPath));
			invariant(
				ast.definitions.length,
				'RelayJSModuleParser: Expected GraphQL text to contain at least one ' +
				'definition (fragment, mutation, query, subscription), got `%s`.',
				template,
			);
			astDefinitions.push(...ast.definitions);
		},
	);

	return {
		kind: 'Document',
		definitions: astDefinitions,
	};
}

export function getParser(baseDir: string): ASTCache {
	return new ASTCache({
		baseDir,
		parse: parseFile,
	});
}

export function getFileFilter(baseDir: string): FileFilter {
	return (file: File) => {
		const text = fs.readFileSync(path.join(baseDir, file.relPath), 'utf8');
		return text.indexOf('graphql') >= 0;
	};
}
