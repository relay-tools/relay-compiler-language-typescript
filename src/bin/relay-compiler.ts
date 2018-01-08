import {
	CodegenRunner,
	ConsoleReporter,
	WatchmanClient,
} from 'relay-compiler/lib/GraphQLCompilerPublic';

import { Map as ImmutableMap } from 'immutable';

import * as RelayTSModuleParser from '../core/RelayTSModuleParser';
import { RelayFileWriter } from '../codegen/RelayFileWriter';
import { IRTransforms as RelayIRTransforms } from 'relay-compiler';

import * as fs from 'fs';
import * as path from 'path';
import * as yargs from 'yargs';

import {
	buildASTSchema,
	buildClientSchema,
	parse,
	printSchema,
	GraphQLSchema,
	DocumentNode
} from '../util/graphql';
import { ParserConfig } from 'types/graphql-compiler/codegen/CodegenRunner';
import { WriterConfig } from 'types/relay-compiler/codegen/RelayFileWriter';
import { GraphQLReporter } from 'types/graphql-compiler/reporters/GraphQLReporter';
import { formatGeneratedModule } from '../codegen/formatGeneratedModule';

const {
	commonTransforms,
	codegenTransforms,
	fragmentTransforms,
	printTransforms,
	queryTransforms,
	schemaExtensions,
} = RelayIRTransforms;

function buildWatchExpression(options: {
	extensions: Array<string>,
	include: Array<string>,
	exclude: Array<string>,
}) {
	return [
		'allof',
		['type', 'f'],
		['anyof', ...options.extensions.map(ext => ['suffix', ext])],
		[
			'anyof',
			...options.include.map(include => ['match', include, 'wholename']),
		],
		...options.exclude.map(exclude => ['not', ['match', exclude, 'wholename']]),
	];
}

function getFilepathsFromGlob(
	baseDir: string,
	options: {
		extensions: Array<string>,
		include: Array<string>,
		exclude: Array<string>,
	},
): Array<string> {
	const { extensions, include, exclude } = options;
	const patterns = include.map(inc => `${inc}/*.+(${extensions.join('|')})`);

	const glob = require('fast-glob');
	return glob.sync(patterns, {
		cwd: baseDir,
		bashNative: [],
		onlyFiles: true,
		ignore: exclude,
	});
}

async function run(options: {
	schema: string,
	src: string,
	extensions: Array<string>,
	include: Array<string>,
	exclude: Array<string>,
	verbose: boolean,
	watchman: boolean,
	outputDir: string | null,
	watch?: boolean | null,
	validate: boolean,
}) {
	const schemaPath = path.resolve(process.cwd(), options.schema);
	if (!fs.existsSync(schemaPath)) {
		throw new Error(`--schema path does not exist: ${schemaPath}.`);
	}
	const srcDir = path.resolve(process.cwd(), options.src);
	if (!fs.existsSync(srcDir)) {
		throw new Error(`--source path does not exist: ${srcDir}.`);
	}
	if (options.watch && !options.watchman) {
		throw new Error('Watchman is required to watch for changes.');
	}
	if (options.watch && !hasWatchmanRootFile(srcDir)) {
		throw new Error(
			`
--watch requires that the src directory have a valid watchman "root" file.

Root files can include:
- A .git/ Git folder
- A .hg/ Mercurial folder
- A .watchmanconfig file

Ensure that one such file exists in ${srcDir} or its parents.
    `.trim(),
		);
	}

	const reporter = new ConsoleReporter({ verbose: options.verbose });

	const useWatchman = options.watchman && (await WatchmanClient.isAvailable());

	const parserConfigs = {
		default: {
			baseDir: srcDir,
			getFileFilter: RelayTSModuleParser.getFileFilter,
			getParser: RelayTSModuleParser.getParser,
			getSchema: () => getSchema(schemaPath),
			watchmanExpression: useWatchman ? buildWatchExpression(options) : null,
			filepaths: useWatchman ? null : getFilepathsFromGlob(srcDir, options),
		} as ParserConfig,
	};
	const writerConfigs = {
		default: {
			getWriter: getRelayFileWriter(srcDir, options.outputDir),
			isGeneratedFile: (filePath: string) =>
				filePath.endsWith('.ts') && filePath.includes('__generated__'),
			parser: 'default',
		},
	};
	const codegenRunner = new CodegenRunner({
		reporter,
		parserConfigs,
		writerConfigs,
		onlyValidate: options.validate,
	});
	if (!options.validate && !options.watch && options.watchman) {
		// eslint-disable-next-line no-console
		console.log('HINT: pass --watch to keep watching for changes.');
	}
	const result = options.watch
		? await codegenRunner.watchAll()
		: await codegenRunner.compileAll();

	if (result === 'ERROR') {
		process.exit(100);
	}
	if (options.validate && result !== 'NO_CHANGES') {
		process.exit(101);
	}
}

function getRelayFileWriter(baseDir: string, outputDir: string | null): (onlyValidate: boolean, schema: GraphQLSchema, baseDocuments: ImmutableMap<string, DocumentNode>, documents: ImmutableMap<string, DocumentNode>, reporter: GraphQLReporter) => RelayFileWriter {
	return (onlyValidate, schema, documents, baseDocuments, reporter) =>
		new RelayFileWriter({
			config: {
				baseDir,
				compilerTransforms: {
					commonTransforms,
					codegenTransforms,
					fragmentTransforms,
					printTransforms,
					queryTransforms,
				},
				customScalars: {},
				formatModule: formatGeneratedModule,
				inputFieldWhiteListForFlow: [],
				schemaExtensions,
				useHaste: false,
				outputDir: outputDir ? path.resolve(outputDir) : undefined,
			},
			onlyValidate,
			schema,
			baseDocuments,
			documents,
			reporter,
		});
}

function getSchema(schemaPath: string): GraphQLSchema {
	try {
		let source = fs.readFileSync(schemaPath, 'utf8');
		if (path.extname(schemaPath) === '.json') {
			source = printSchema(buildClientSchema(JSON.parse(source).data));
		}
		source = `
  directive @include(if: Boolean) on FRAGMENT_SPREAD | FIELD
  directive @skip(if: Boolean) on FRAGMENT_SPREAD | FIELD

  ${source}
  `;
		return (buildASTSchema as any)(parse(source), { assumeValid: true }) as GraphQLSchema;
	} catch (error) {
		throw new Error(
			`
Error loading schema. Expected the schema to be a .graphql or a .json
file, describing your GraphQL server's API. Error detail:

${error.stack}
    `.trim(),
		);
	}
}

// Ensure that a watchman "root" file exists in the given directory
// or a parent so that it can be watched
const WATCHMAN_ROOT_FILES = ['.git', '.hg', '.watchmanconfig'];
function hasWatchmanRootFile(testPath: string) {
	while (path.dirname(testPath) !== testPath) {
		if (
			WATCHMAN_ROOT_FILES.some(file => {
				return fs.existsSync(path.join(testPath, file));
			})
		) {
			return true;
		}
		testPath = path.dirname(testPath);
	}
	return false;
}

// Collect args
const argv = yargs
	.usage(
	'Create Relay generated files\n\n' +
	'$0 --schema <path> --src <path> [--watch]',
)
	.options({
		schema: {
			describe: 'Path to schema.graphql or schema.json',
			demandOption: true,
			type: 'string',
		},
		src: {
			describe: 'Root directory of application code',
			demandOption: true,
			type: 'string',
		},
		include: {
			array: true,
			default: ['**'],
			describe: 'Directories to include under src',
			type: 'string',
		},
		exclude: {
			array: true,
			default: [
				'**/node_modules/**',
				'**/__mocks__/**',
				'**/__tests__/**',
				'**/__generated__/**',
			],
			describe: 'Directories to ignore under src',
			type: 'string',
		},
		extensions: {
			array: true,
			default: ['ts', 'tsx'],
			describe: 'File extensions to compile (--extensions ts tsx)',
			type: 'string',
		},
		outputDir: {
			default: null,
			describe: 'Output all artifacts into this directory instead of under a __generated__ folder where the source file is located',
			type: 'string',
		},
		verbose: {
			describe: 'More verbose logging',
			type: 'boolean',
		},
		watchman: {
			describe: 'Use watchman when not in watch mode',
			type: 'boolean',
			default: true,
		},
		watch: {
			describe: 'If specified, watches files and regenerates on changes',
			type: 'boolean',
		},
		validate: {
			describe:
				'Looks for pending changes and exits with non-zero code instead of ' +
				'writing to disk',
			type: 'boolean',
			default: false,
		},
	})
	.help().argv;

// Run script with args
run(argv as any).catch((error: Error | any) => {
	console.error(String(error.stack || error));
	process.exit(1);
});
