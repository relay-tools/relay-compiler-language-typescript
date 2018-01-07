declare type GeneratedNode = any;
import { CompilerContext, IRTransform, Reporter } from 'relay-compiler/lib/GraphQLCompilerPublic';

/**
 * Transforms the provided compiler context
 *
 * compileRelayArtifacts generates artifacts for Relay's runtime as a result of
 * applying a series of transforms. Each kind of artifact is dependent on
 * transforms being applied in the following order:
 *
 *   - Fragment Readers: commonTransforms, fragmentTransforms
 *   - Operation Writers: commonTransforms, queryTransforms, codegenTransforms
 *   - GraphQL Text: commonTransforms, queryTransforms, printTransforms
 *
 * The order of the transforms applied for each artifact below is important.
 * CompilerContext will memoize applying each transform, so while
 * `commonTransforms` appears in each artifacts' application, it will not result
 * in repeated work as long as the order remains consistent across each context.
 */
declare function compileRelayArtifacts(
	context: CompilerContext,
	transforms: compileRelayArtifacts.RelayCompilerTransforms,
	reporter?: Reporter,
): Array<GeneratedNode>;

declare namespace compileRelayArtifacts {
	export type RelayCompilerTransforms = {
		commonTransforms: Array<IRTransform>,
		codegenTransforms: Array<IRTransform>,
		fragmentTransforms: Array<IRTransform>,
		printTransforms: Array<IRTransform>,
		queryTransforms: Array<IRTransform>,
	};
}

export = compileRelayArtifacts;
export as namespace compileRelayArtifacts;
