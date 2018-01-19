import { RelayConcreteNode } from "relay-runtime";
import { Root, Fragment, IRTransform } from "../../graphql-compiler";

export type GraphQLTag = {
  keyName: string | null;
  template: string;
  sourceLocationOffset: {
    /* TODO: Is this also expected to use 1-based index? */
    line: number;
    /* Should use 1-based index */
    column: number;
  };
};

/**
 * Generate a module for the given document name/text.
 */
export type FormatModule = (
  args: {
    moduleName: string;
    documentType:
      | typeof RelayConcreteNode.FRAGMENT
      | typeof RelayConcreteNode.REQUEST
      | typeof RelayConcreteNode.BATCH_REQUEST
      | null;
    docText: string | null;
    concreteText: string;
    typeText: string;
    hash: string | null;
    devOnlyAssignments: string | null;
    relayRuntimeModule: string;
    sourceHash: string;
  }
) => string;

export type GraphQLTagFinder = (text: string, filePath: string) => Array<GraphQLTag>;

export interface TypeGeneratorOptions {
  readonly customScalars: { [type: string]: string },
  readonly useHaste: boolean,
  readonly enumsHasteModule: string | null,
  readonly existingFragmentNames: Set<string>,
  readonly inputFieldWhiteList: ReadonlyArray<string>,
  readonly relayRuntimeModule: string,
}

export interface TypeGenerator {
  transforms: Array<IRTransform>;
  generate: (node: Root | Fragment, options: TypeGeneratorOptions) => string;
}

export interface PluginInterface {
  inputExtensions: string[];
  outputExtension: string;
  findGraphQLTags: GraphQLTagFinder;
  formatModule: FormatModule;
  typeGenerator: TypeGenerator;
}
