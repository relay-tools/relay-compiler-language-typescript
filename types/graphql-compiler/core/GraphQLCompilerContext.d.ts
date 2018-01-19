import { OrderedMap as ImmutableOrderedMap } from "immutable";

import { GraphQLReporter } from "../reporters/GraphQLReporter";
import { Fragment, Root } from "./GraphQLIR";
import { GraphQLSchema } from "graphql";
/**
 * An immutable representation of a corpus of documents being compiled together.
 * For each document, the context stores the IR and any validation errors.
 */
export class GraphQLCompilerContext {
  public readonly serverSchema: GraphQLSchema;
  public readonly clientSchema: GraphQLSchema;

  public constructor(serverSchema: GraphQLSchema, clientSchema?: GraphQLSchema);

  /**
   * Returns the documents for the context in the order they were added.
   */
  documents(): Array<Fragment | Root>;

  forEachDocument(fn: (doc: Fragment | Root) => void): void;

  replace(node: Fragment | Root): GraphQLCompilerContext;

  add(node: Fragment | Root): GraphQLCompilerContext;

  addAll(nodes: Array<Fragment | Root>): GraphQLCompilerContext;

  /**
   * Apply a list of compiler transforms and return a new compiler context.
   */
  applyTransforms(
    transforms: Array<IRTransform>,
    reporter?: GraphQLReporter
  ): GraphQLCompilerContext;

  /**
   * Applies a transform to this context, returning a new context.
   *
   * This is memoized such that applying the same sequence of transforms will
   * not result in duplicated work.
   */
  applyTransform(
    transform: IRTransform,
    reporter?: GraphQLReporter
  ): GraphQLCompilerContext;

  get(name: string): (Fragment | Root) | undefined;

  getFragment(name: string): Fragment;

  getRoot(name: string): Root;

  remove(name: string): GraphQLCompilerContext;

  withMutations(
    fn: (context: GraphQLCompilerContext) => GraphQLCompilerContext
  ): GraphQLCompilerContext;
}

export type IRTransform = (
  context: GraphQLCompilerContext
) => GraphQLCompilerContext;
