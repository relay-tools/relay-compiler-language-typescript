import * as CodegenDirectory from './CodegenDirectory';
export type CompileResult = 'HAS_CHANGES' | 'NO_CHANGES' | 'ERROR';

export type File = {
	relPath: string;
	hash: string;
};

export interface FileWriterInterface {
	writeAll(): Promise<Map<string, CodegenDirectory>>;
}
