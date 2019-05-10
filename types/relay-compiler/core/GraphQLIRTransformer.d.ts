import { GraphQLCompilerContext } from "./GraphQLCompilerContext";

export type IRTransform = (
  context: GraphQLCompilerContext
) => GraphQLCompilerContext;

// Transforms applied to fragments used for reading data from a store
export const FRAGMENT_TRANSFORMS: IRTransform[];

// Transforms applied to queries/mutations/subscriptions that are used for
// fetching data from the server and parsing those responses.
export const QUERY_TRANSFORMS: IRTransform[];

// Transforms applied to the code used to process a query response.
export const CODEGEN_TRANSFORMS: IRTransform[];
