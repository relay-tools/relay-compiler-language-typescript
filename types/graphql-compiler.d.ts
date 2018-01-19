import * as CodegenDir from './graphql-compiler/codegen/CodegenDirectory';
export const CodegenDirectory: typeof CodegenDir;

import * as GraphQLIRTransformer from './graphql-compiler/core/GraphQLIRTransformer';
export const IRTransformer: typeof GraphQLIRTransformer;

export { GraphQLCompilerContext as CompilerContext, IRTransform } from './graphql-compiler/core/GraphQLCompilerContext';
import { IRTransform } from './graphql-compiler/core/GraphQLCompilerContext';

import * as GraphQLSchemaUtils from './graphql-compiler/core/GraphQLSchemaUtils';
export const SchemaUtils: typeof GraphQLSchemaUtils;

export * from './graphql-compiler/core/GraphQLIR';

export const IRVisitor: {
	visit(obj: any, visitors: any): any;
};
