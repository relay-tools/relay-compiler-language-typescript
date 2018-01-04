import { Map as ImmutableMap } from 'immutable';

import { File } from '../codegen/CodegenTypes';
import { DocumentNode } from 'graphql';

type ParseFn = (baseDir: string, file: File) => DocumentNode | null | undefined;

declare class ASTCache {
	constructor(config: { baseDir: string; parse: ParseFn });
	// Short-term: we don't do subscriptions/delta updates, instead always use all definitions
	documents(): ImmutableMap<string, DocumentNode>;

	// parse should return the set of changes
	parseFiles(files: Set<File>): ImmutableMap<string, DocumentNode>;
}

declare namespace ASTCache {

}

export = ASTCache;
export as namespace ASTCache;
