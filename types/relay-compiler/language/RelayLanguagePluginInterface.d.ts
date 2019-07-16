import { RelayConcreteNode } from "relay-runtime";
import { Fragment, Root } from "../core/GraphQLIR";
import { IRTransform } from "../core/GraphQLIRTransformer";

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
      | "ConcreteFragment"
      | "ConcreteRequest"
      | "ReaderFragment"
      | null;
    docText: string | null;
    concreteText: string;
    typeText: string;
    devOnlyAssignments: string | null | undefined;
    hash: string | null | undefined;
    sourceHash: string;
  }
) => string;

export type GraphQLTagFinder = (text: string, filePath: string) => GraphQLTag[];

export interface TypeGeneratorOptions {
  readonly customScalars: { [type: string]: string };
  readonly useHaste: boolean;
  readonly enumsHasteModule: string | null;
  readonly existingFragmentNames: Set<string>;
  readonly optionalInputFields: ReadonlyArray<string>;
  readonly useSingleArtifactDirectory: boolean;
  readonly noFutureProofEnums: boolean;
}

export interface TypeGenerator {
  transforms: IRTransform[];
  generate: (node: Root | Fragment, options: TypeGeneratorOptions) => string;
}

export interface PluginInterface {
  inputExtensions: string[];
  outputExtension: string;
  findGraphQLTags: GraphQLTagFinder;
  formatModule: FormatModule;
  typeGenerator: TypeGenerator;
}
