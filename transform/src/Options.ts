import { GraphQLSchema, buildClientSchema, buildASTSchema, parse } from "graphql";
import * as fs from 'fs';
import * as path from 'path';
import { RelayQLTransformer } from "./RelayQLTransformer";
import { SCHEMA_EXTENSION } from "./GraphQLRelayDirective";

export interface Options {
	artifactDirectory?: string;
	compat?: boolean;
	schema?: string;
	isDevVariable?: string;
	buildCommand?: string;
	isDevelopment?: boolean;
	substituteVariables?: boolean;
}

export interface NormalizedOptions {
	artifactDirectory?: string;
	compat?: boolean;
	relayQLTransformer?: RelayQLTransformer;
	isDevVariable?: string;
	buildCommand?: string;
	isDevelopment?: boolean;
	substituteVariables?: boolean;
}

const dotJsonLength = '.json'.length;
const dotGraphQLLength = '.graphql'.length;

export function readGraphQLSchema(schemaPath: string): GraphQLSchema {
	const contents = fs.readFileSync(path.resolve(schemaPath), { encoding: 'utf8' });
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
		return buildASTSchema(parse(SCHEMA_EXTENSION + "\n" + contents, {
			allowLegacySDLImplementsInterfaces: true,
			allowLegacySDLEmptyFields: true,
		}));
	}
	throw new Error('Unsupported file. schema option only supports json and graphql file extensions');
}

export function normalizeOptions(options: Options): NormalizedOptions {
	const { schema, ...opts } = options;
	return {
		...opts,
		relayQLTransformer: options.schema ? new RelayQLTransformer(readGraphQLSchema(options.schema), {
			inputArgumentName: 'input',
			snakeCase: false,
			substituteVariables: options.substituteVariables || false,
			validator: null,
		}) : undefined,
	};
}
