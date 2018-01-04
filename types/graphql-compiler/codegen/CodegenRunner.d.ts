import * as CodegenDirectory from './CodegenDirectory';
import * as CodegenWatcher from './CodegenWatcher';

import { Map as ImmutableMap } from 'immutable';

import * as ASTCache from '../core/ASTCache';
import { GraphQLReporter } from '../reporters/GraphQLReporter';
import { CompileResult, File, FileWriterInterface } from './CodegenTypes';
import { FileFilter, WatchmanExpression } from './CodegenWatcher';
import { DocumentNode, GraphQLSchema } from 'graphql';

declare class CodegenRunner {
	parserConfigs: CodegenRunner.ParserConfigs;
	writerConfigs: CodegenRunner.WriterConfigs;
	onlyValidate: boolean;
	parsers: CodegenRunner.Parsers;
	// parser => writers that are affected by it
	parserWriters: { [parser: string]: Set<string> };

	public constructor(options: {
		parserConfigs: CodegenRunner.ParserConfigs;
		writerConfigs: CodegenRunner.WriterConfigs;
		onlyValidate: boolean;
		reporter: GraphQLReporter;
	});

	public compileAll(): Promise<CompileResult>;

	public compile(writerName: string): Promise<CompileResult>;

	public getDirtyWriters(filePaths: Array<string>): Promise<Set<string>>;

	public parseEverything(parserName: string): Promise<void>;

	public parseFileChanges(parserName: string, files: Set<File>): void;

	// We cannot do incremental writes right now.
	// When we can, this could be writeChanges(writerName, parserName, parsedDefinitions)
	public write(writerName: string): Promise<CompileResult>;

	public watchAll(): Promise<void>;

	public watch(parserName: string): Promise<void>;
}

declare namespace CodegenRunner {
	export type GetWriter = (
		onlyValidate: boolean,
		schema: GraphQLSchema,
		documents: ImmutableMap<string, DocumentNode>,
		baseDocuments: ImmutableMap<string, DocumentNode>,
		reporter: GraphQLReporter,
	) => FileWriterInterface;

	export type WriterConfig = {
		parser: string;
		baseParsers?: Array<string>;
		isGeneratedFile: (filePath: string) => boolean;
		getWriter: GetWriter;
	};

	export interface ParserConfig {
		baseDir: string;
		getFileFilter?: (baseDir: string) => FileFilter;
		getParser: (baseDir: string) => ASTCache;
		getSchema: () => GraphQLSchema;
		watchmanExpression?: WatchmanExpression | null;
		filepaths?: Array<string> | null;
	}

	export interface ParserConfigs {
		[parser: string]: ParserConfig;
	}

	export interface Parsers {
		[parser: string]: ASTCache;
	}

	export type WriterConfigs = {
		[writer: string]: WriterConfig;
	};
}

export = CodegenRunner;
export as namespace CodegenRunner;
