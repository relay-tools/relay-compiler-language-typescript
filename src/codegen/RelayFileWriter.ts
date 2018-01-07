import { compileRelayArtifacts } from 'relay-compiler';
import * as RelayParser from 'relay-compiler/lib/RelayParser';
import * as RelayValidator from 'relay-compiler/lib/RelayValidator';

type RelayCompilerTransforms = compileRelayArtifacts.RelayCompilerTransforms;

import * as crypto from 'crypto';
import * as graphql from 'graphql';
import * as invariant from 'invariant';
import * as path from 'path';
import * as writeRelayGeneratedFile from 'relay-compiler/lib/writeRelayGeneratedFile';
import * as RelayTSGenerator from '../core/RelayTSGenerator';

type FormatModule = writeRelayGeneratedFile.FormatModule;

import {
	ASTConvert,
	CodegenDirectory,
	CompilerContext,
	SchemaUtils,
} from 'relay-compiler/lib/GraphQLCompilerPublic';
import { Map as ImmutableMap } from 'immutable';

import { ScalarTypeMapping } from 'relay-compiler';
import { FileWriterInterface, Reporter } from 'relay-compiler/lib/GraphQLCompilerPublic';
import { DocumentNode, GraphQLSchema, ValidationContext, ASTNode, OperationDefinitionNode, FragmentDefinitionNode, ScalarTypeDefinitionNode, ObjectTypeDefinitionNode, DirectiveDefinitionNode, } from 'graphql';

const { isOperationDefinitionAST } = SchemaUtils;

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

export class RelayFileWriter implements FileWriterInterface {
	private _onlyValidate: boolean;
	private _config: WriterConfig;
	private _baseSchema: GraphQLSchema;
	private _baseDocuments: ImmutableMap<string, DocumentNode>;
	private _documents: ImmutableMap<string, DocumentNode>;
	private _reporter: Reporter;

	constructor({
		config,
		onlyValidate,
		baseDocuments,
		documents,
		schema,
		reporter,
  }: {
			config: WriterConfig,
			onlyValidate: boolean,
			baseDocuments: ImmutableMap<string, DocumentNode>,
			documents: ImmutableMap<string, DocumentNode>,
			schema: GraphQLSchema,
			reporter: Reporter,
		}) {
		this._baseDocuments = baseDocuments || ImmutableMap();
		this._baseSchema = schema;
		this._config = config;
		this._documents = documents;
		this._onlyValidate = onlyValidate;
		this._reporter = reporter;

		validateConfig(this._config);
	}

	public async writeAll(): Promise<Map<string, CodegenDirectory>> {
		// Can't convert to IR unless the schema already has Relay-local extensions
		const transformedSchema = ASTConvert.transformASTSchema(
			this._baseSchema,
			this._config.schemaExtensions,
		);
		const extendedSchema = ASTConvert.extendASTSchema(
			transformedSchema,
			this._baseDocuments
				.merge(this._documents)
				.valueSeq()
				.toArray(),
		);

		// Build a context from all the documents
		const baseDefinitionNames = new Set();
		this._baseDocuments.forEach(doc => {
			doc!.definitions.forEach(def => {
				if (isOperationDefinitionAST(def) && def.name) {
					baseDefinitionNames.add(def.name.value);
				}
			});
		});
		const definitionsMeta = new Map();
		const getDefinitionMeta = (definitionName: string) => {
			const definitionMeta = definitionsMeta.get(definitionName);
			invariant(
				definitionMeta,
				'RelayFileWriter: Could not determine source for definition: `%s`.',
				definitionName,
			);
			return definitionMeta;
		};
		const allOutputDirectories: Map<string, CodegenDirectory> = new Map();
		const addCodegenDir = (dirPath: string) => {
			const codegenDir = new CodegenDirectory(dirPath, {
				onlyValidate: this._onlyValidate,
			});
			allOutputDirectories.set(dirPath, codegenDir);
			return codegenDir;
		};

		let configOutputDirectory: CodegenDirectory;
		if (this._config.outputDir) {
			configOutputDirectory = addCodegenDir(this._config.outputDir);
		}

		this._documents.forEach((doc, filePath) => {
			doc!.definitions.forEach(def => {
				if (def.kind !== 'SchemaDefinition' && def.kind !== 'TypeExtensionDefinition' && def.name) {
					definitionsMeta.set(def.name.value, {
						dir: path.join(this._config.baseDir, path.dirname(filePath!)),
						ast: def,
					});
				}
			});
		});

		// Verify using local and global rules, can run global verifications here
		// because all files are processed together
		let validationRules = [
			...RelayValidator.LOCAL_RULES,
			...RelayValidator.GLOBAL_RULES,
		];
		const customizedValidationRules = this._config.validationRules;
		if (customizedValidationRules) {
			validationRules = [
				...validationRules,
				...(customizedValidationRules.LOCAL_RULES || []),
				...(customizedValidationRules.GLOBAL_RULES || []),
			];
		}

		const definitions = ASTConvert.convertASTDocumentsWithBase(
			extendedSchema,
			this._baseDocuments.valueSeq().toArray(),
			this._documents.valueSeq().toArray(),
			validationRules,
			RelayParser.transform.bind(RelayParser),
		);

		const compilerContext = new CompilerContext(
			this._baseSchema,
			extendedSchema,
		).addAll(definitions);

		const getGeneratedDirectory = (definitionName: string) => {
			if (configOutputDirectory) {
				return configOutputDirectory;
			}
			const generatedPath = path.join(
				getDefinitionMeta(definitionName).dir,
				'__generated__',
			);
			let cachedDir = allOutputDirectories.get(generatedPath);
			if (!cachedDir) {
				cachedDir = addCodegenDir(generatedPath);
			}
			return cachedDir;
		};

		const transformedTSContext = compilerContext.applyTransforms(
			RelayTSGenerator.TS_TRANSFORMS,
			this._reporter,
		);
		const transformedQueryContext = compilerContext.applyTransforms(
			[
				...this._config.compilerTransforms.commonTransforms,
				...this._config.compilerTransforms.queryTransforms,
			],
			this._reporter,
		);
		const artifacts = compileRelayArtifacts(
			compilerContext,
			this._config.compilerTransforms,
			this._reporter,
		);

		const existingFragmentNames = new Set(
			definitions.map(definition => definition.name),
		);

		// TODO(T22651734): improve this to correctly account for fragments that
		// have generated flow types.
		baseDefinitionNames.forEach(baseDefinitionName => {
			existingFragmentNames.delete(baseDefinitionName);
		});

		const formatModule = this._config.formatModule;
		const persistQuery = this._config.persistQuery || null;

		try {
			await Promise.all(
				artifacts.map(async node => {
					if (baseDefinitionNames.has(node.name)) {
						// don't add definitions that were part of base context
						return;
					}
					if (node.metadata && node.metadata.deferred) {
						// don't write deferred operations, the batch request is
						// responsible for them
						return;
					}
					const relayRuntimeModule =
						this._config.relayRuntimeModule || 'relay-runtime';

					const flowNode = transformedTSContext.get(node.name);
					invariant(
						flowNode,
						'RelayFileWriter: did not compile flow types for: %s',
						node.name,
					);

					const directory = getGeneratedDirectory(node.name);

					// generate typescript types
					const tsTypes = RelayTSGenerator.generate(flowNode!, {
						customScalars: this._config.customScalars,
						enumsHasteModule: this._config.enumsHasteModule,
						existingFragmentNames,
						inputFieldWhiteList: this._config.inputFieldWhiteListForFlow,
						relayRuntimeModule,
						getGeneratedDirectory,
						destinationDirectory: directory,
						useHaste: this._config.useHaste,
					});

					const sourceHash = md5(graphql.print(getDefinitionMeta(node.name).ast));

					await writeRelayGeneratedFile(
						directory,
						'.ts',
						node,
						formatModule,
						tsTypes, // typescript types
						persistQuery,
						this._config.platform || null,
						relayRuntimeModule,
						sourceHash,
					);
				}),
			);

			const generateExtraFiles = this._config.generateExtraFiles;
			if (generateExtraFiles) {
				const configDirectory = this._config.outputDir;
				generateExtraFiles(
					dir => {
						const outputDirectory = dir || configDirectory;
						invariant(
							outputDirectory,
							'RelayFileWriter: cannot generate extra files without specifying ' +
							'an outputDir in the config or passing it in.',
						);
						const outDir = outputDirectory!;
						let outputDir = allOutputDirectories.get(outDir);
						if (!outputDir) {
							outputDir = addCodegenDir(outDir);
						}
						return outputDir;
					},
					transformedQueryContext,
					getGeneratedDirectory,
				);
			}

			// clean output directories
			allOutputDirectories.forEach(dir => {
				dir.deleteExtraFiles();
			});
		} catch (error) {
			let details;
			try {
				details = JSON.parse(error.message);
			} catch (_) { }
			if (
				details &&
				details.name === 'GraphQL2Exception' &&
				details.message
			) {
				throw new Error('GraphQL error writing modules:\n' + details.message);
			}
			throw new Error(
				'Error writing modules:\n' + String(error.stack || error),
			);
		}

		return allOutputDirectories;
	}
}

function md5(x: string): string {
	return crypto
		.createHash('md5')
		.update(x, 'utf8')
		.digest('hex');
}

function validateConfig(config: Object): void {
	if ((config as any).buildCommand) {
		process.stderr.write(
			'WARNING: RelayFileWriter: For RelayFileWriter to work you must ' +
			'replace config.buildCommand with config.formatModule.\n',
		);
	}
}
