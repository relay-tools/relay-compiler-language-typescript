export { CompileResult, File, FileWriterInterface } from './graphql-compiler/codegen/CodegenTypes';

import * as CodegenDir from './graphql-compiler/codegen/CodegenDirectory';
export const CodegenDirectory: typeof CodegenDir;

export * from './graphql-compiler/core/ASTConvert';

import * as astCache from './graphql-compiler/core/ASTCache';
export const ASTCache: typeof astCache;

export { FileFilter } from './graphql-compiler/codegen/CodegenWatcher';

import * as GraphQLWatchmanClient from './graphql-compiler/core/GraphQLWatchmanClient';
export const WatchmanClient: typeof GraphQLWatchmanClient;

import * as GraphQLCodegenRunner from './graphql-compiler/codegen/CodegenRunner';
export const CodegenRunner: typeof GraphQLCodegenRunner

import * as GraphQLConsoleReporter from './graphql-compiler/reporters/GraphQLConsoleReporter';
export const ConsoleReporter: typeof GraphQLConsoleReporter;

import * as GraphQLIRTransformer from './graphql-compiler/core/GraphQLIRTransformer';
export const IRTransformer: typeof GraphQLIRTransformer;

export { GraphQLCompilerContext as CompilerContext, IRTransform } from './graphql-compiler/core/GraphQLCompilerContext';
import { IRTransform } from './graphql-compiler/core/GraphQLCompilerContext';

import * as astConvert from './graphql-compiler/core/ASTConvert';
export const ASTConvert: typeof astConvert;

export { GraphQLReporter as Reporter } from './graphql-compiler/reporters/GraphQLReporter';

import * as GraphQLSchemaUtils from './graphql-compiler/core/GraphQLSchemaUtils';
export const SchemaUtils: typeof GraphQLSchemaUtils;

import * as GraphQLParser from './graphql-compiler/core/GraphQLParser';
export const Parser: typeof GraphQLParser;

export * from './graphql-compiler/core/GraphQLIR';

export const IRVisitor: {
	visit(obj: any, visitors: any): any;
};

import * as flattenTransform from './graphql-compiler/transforms/FlattenTransform';

export const FlattenTransform: typeof flattenTransform;
