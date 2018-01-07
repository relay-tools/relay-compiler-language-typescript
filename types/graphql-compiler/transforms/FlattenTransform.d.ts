import { IRTransform } from '../core/GraphQLCompilerContext';

export interface FlattenOptions {
	flattenAbstractTypes?: boolean,
	flattenInlineFragments?: boolean,
}

// Note this seems to be changing later on
export function transformWithOptions(options: FlattenOptions): IRTransform;
