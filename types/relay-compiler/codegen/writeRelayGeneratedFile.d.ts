
import { CodegenDirectory } from 'relay-compiler/lib/GraphQLCompilerPublic';

declare function writeRelayGeneratedFile(
	codegenDir: CodegenDirectory,
	fileExtension: string,
	generatedNode: any, //GeneratedNode,
	formatModule: writeRelayGeneratedFile.FormatModule,
	flowText: string,
	_persistQuery: null | ((text: string) => Promise<string>),
	platform: string | null,
	relayRuntimeModule: string,
	sourceHash: string,
): Promise<any | null /*GeneratedNode*/>;

declare namespace writeRelayGeneratedFile {
	/**
 	 * Generate a module for the given document name/text.
 	 */
	export type FormatModule = (module: {
		moduleName: string,
		documentType:
		| 'Fragment'
		| 'Request'
		| 'BatchRequest',
		docText: string | null,
		concreteText: string,
		flowText: string,
		hash: string | null,
		devOnlyAssignments: string | null,
		relayRuntimeModule: string,
		sourceHash: string,
	}) => string;
}

export = writeRelayGeneratedFile;
export as namespace writeRelayGeneratedFile;
