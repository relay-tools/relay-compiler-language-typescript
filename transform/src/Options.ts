import { GraphQLSchema, buildClientSchema, buildASTSchema, parse } from "graphql";
import * as fs from 'fs';

export interface Options {
	artifactDirectory?: string;
	compat?: boolean;
	schema?: string;
	isDevVariable?: string;
	buildCommand?: string;
	isDevelopment?: boolean;
}

export interface NormalizedOptions {
	artifactDirectory?: string;
	compat?: boolean;
	schema?: GraphQLSchema;
	isDevVariable?: string;
	buildCommand?: string;
	isDevelopment?: boolean;
}

const dotJsonLength = '.json'.length;
const dotGraphQLLength = '.graphql'.length;

export function readGraphQLSchema(schemaPath: string): GraphQLSchema {
	const contents = fs.readFileSync(schemaPath, { encoding: 'utf8' });
	if (schemaPath.substring(schemaPath.length - dotJsonLength) === '.json') {
		const json = JSON.parse(contents);
		if (json.__schema) {
			return buildClientSchema(json);
		}
		if (json.data && json.data.__schema) {
			return buildClientSchema(json.data);
		}
		throw new Error('Expected data file to contain a JSON encoded GraphQLSchema');
	} else if (schemaPath.substring(schemaPath.length - dotGraphQLLength) === '.graphql') {
		return buildASTSchema(parse(contents));
	}
	throw new Error('Unsupported file. schema option only supports json and graphql file extensions');
}

export function normalizeOptions(options: Options): NormalizedOptions {
	return {
		...options,
		schema: options.schema ? readGraphQLSchema(options.schema) : undefined,
	};
}
