import { createTransformError } from "./createTransformError";
import * as ts from "typescript";
import { NormalizedOptions } from "./Options";
import { RelayQLTransformer } from "./RelayQLTransformer";

/**
 * Given all the metadata about a found RelayQL tag, compile it and return
 * the resulting TS AST.
 */
export function compileRelayQLTag(
	ctx: ts.TransformationContext,
	options: NormalizedOptions,
	transformer: RelayQLTransformer,
	node: ts.TaggedTemplateExpression,
	documentName: string,
	propName: string | null,
	tagName: string,
	enableValidation: boolean,
): ts.Expression {
	try {
		return transformer.transform(node, {
			documentName,
			propName,
			tagName,
			enableValidation,
		});
	} catch (e) {
		throw createTransformError(e);
	}
}
