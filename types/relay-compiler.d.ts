import * as RelayIRTransforms from "./relay-compiler/core/RelayIRTransforms";
export const IRTransforms: typeof RelayIRTransforms;

export * from "./relay-compiler/language/RelayLanguagePluginInterface";

export const IRVisitor: {
  visit(obj: any, visitors: any): any;
};

import * as GraphQLSchemaUtils from "./relay-compiler/core/GraphQLSchemaUtils";
export const SchemaUtils: typeof GraphQLSchemaUtils;
export { Fragment, Root } from "./relay-compiler/core/GraphQLIR";
