import {
	ASTConvert,
	CodegenDirectory,
	CompilerContext,
	SchemaUtils,
} from 'relay-compiler/lib/GraphQLCompilerPublic';
import { Map as ImmutableMap } from 'immutable';

import { ScalarTypeMapping } from '../core/RelayFlowTypeTransformers';
import { RelayCompilerTransforms } from './compileRelayArtifacts';
import { FormatModule } from './writeRelayGeneratedFile';
import { FileWriterInterface, Reporter } from 'relay-compiler/lib/GraphQLCompilerPublic';
import { DocumentNode, GraphQLSchema, ValidationContext } from 'graphql';

declare class RelayFileWriter implements FileWriterInterface {
	constructor(options: {
		config: RelayFileWriter.WriterConfig,
		onlyValidate: boolean,
		baseDocuments: ImmutableMap<string, DocumentNode>,
		documents: ImmutableMap<string, DocumentNode>,
		schema: GraphQLSchema,
		reporter: Reporter,
	});

	writeAll(): Promise<Map<string, CodegenDirectory>>;
}

declare namespace RelayFileWriter {

	export type GenerateExtraFiles = (
		getOutputDirectory: (path?: string) => CodegenDirectory,
		compilerContext: CompilerContext,
		getGeneratedDirectory: (definitionName: string) => CodegenDirectory,
	) => void;

	export type ValidationRule = (context: ValidationContext) => any;

	export type WriterConfig = {
		baseDir: string,
		compilerTransforms: RelayCompilerTransforms,
		customScalars: ScalarTypeMapping,
		formatModule: FormatModule,
		generateExtraFiles?: GenerateExtraFiles,
		inputFieldWhiteListForFlow: Array<string>,
		outputDir?: string,
		persistQuery?: (text: string) => Promise<string>,
		platform?: string,
		relayRuntimeModule?: string,
		schemaExtensions: Array<string>,
		useHaste: boolean,
		// Haste style module that exports flow types for GraphQL enums.
		// TODO(T22422153) support non-haste environments
		enumsHasteModule?: string,
		validationRules?: {
			GLOBAL_RULES?: Array<ValidationRule>,
			LOCAL_RULES?: Array<ValidationRule>,
		},
	};

}

export = RelayFileWriter;
export as namespace RelayFileWriter;
