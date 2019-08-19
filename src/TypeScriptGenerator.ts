import { GraphQLNonNull, GraphQLString } from "graphql";
import {
  Fragment,
  IRTransforms,
  IRVisitor,
  Root,
  SchemaUtils,
  TypeGenerator,
  TypeGeneratorOptions
} from "relay-compiler";
import {
  Condition,
  FragmentSpread,
  InlineFragment,
  LinkedField,
  ModuleImport,
  ScalarField
} from "types/relay-compiler/core/GraphQLIR";
import * as ts from "typescript";
import {
  State,
  transformInputType,
  transformScalarType
} from "./TypeScriptTypeTransformers";

const { isAbstractType } = SchemaUtils;

const REF_TYPE = " $refType";
const FRAGMENT_REFS = " $fragmentRefs";
const DATA = " $data";

export const generate: TypeGenerator["generate"] = (node, options) => {
  const ast: ts.Statement[] = IRVisitor.visit(node, createVisitor(options));
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });
  const resultFile = ts.createSourceFile(
    "grapghql-def.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  const fullProgramAst = ts.updateSourceFileNode(resultFile, ast);
  return printer.printNode(ts.EmitHint.SourceFile, fullProgramAst, resultFile);
};

type Selection = {
  key: string;
  schemaName?: string;
  value?: any;
  nodeType?: any;
  conditional?: boolean;
  concreteType?: string;
  ref?: string;
  nodeSelections?: SelectionMap | null;
};
type SelectionMap = Map<string, Selection>;

function nullthrows<T>(obj: T | null | undefined): T {
  if (obj == null) {
    throw new Error("Obj is null");
  }
  return obj;
}

function makeProp(
  selection: Selection,
  state: State,
  unmasked: boolean,
  concreteType?: string
): ts.PropertySignature {
  let { value } = selection;
  const { key, schemaName, conditional, nodeType, nodeSelections } = selection;
  if (nodeType) {
    value = transformScalarType(
      nodeType,
      state,
      selectionsToAST(
        [Array.from(nullthrows(nodeSelections).values())],
        state,
        unmasked
      )
    );
  }
  if (schemaName === "__typename" && concreteType) {
    value = ts.createLiteralTypeNode(ts.createLiteral(concreteType));
  }
  return readOnlyObjectTypeProperty(key, value, conditional);
}

const isTypenameSelection = (selection: Selection) =>
  selection.schemaName === "__typename";
const hasTypenameSelection = (selections: Selection[]) =>
  selections.some(isTypenameSelection);
const onlySelectsTypename = (selections: Selection[]) =>
  selections.every(isTypenameSelection);

function selectionsToAST(
  selections: Selection[][],
  state: State,
  unmasked: boolean,
  fragmentTypeName?: string
): ts.TypeNode {
  const baseFields = new Map<string, Selection>();
  const byConcreteType: { [type: string]: Selection[] } = {};

  flattenArray(selections).forEach(selection => {
    const { concreteType } = selection;
    if (concreteType) {
      byConcreteType[concreteType] = byConcreteType[concreteType] || [];
      byConcreteType[concreteType].push(selection);
    } else {
      const previousSel = baseFields.get(selection.key);

      baseFields.set(
        selection.key,
        previousSel ? mergeSelection(selection, previousSel) : selection
      );
    }
  });

  const types: ts.PropertySignature[][] = [];

  if (
    Object.keys(byConcreteType).length > 0 &&
    onlySelectsTypename(Array.from(baseFields.values())) &&
    (hasTypenameSelection(Array.from(baseFields.values())) ||
      Object.keys(byConcreteType).every(type =>
        hasTypenameSelection(byConcreteType[type])
      ))
  ) {
    const typenameAliases = new Set<string>();
    for (const concreteType in byConcreteType) {
      types.push(
        groupRefs([
          ...Array.from(baseFields.values()),
          ...byConcreteType[concreteType]
        ]).map(selection => {
          if (selection.schemaName === "__typename") {
            typenameAliases.add(selection.key);
          }
          return makeProp(selection, state, unmasked, concreteType);
        })
      );
    }

    // It might be some other type then the listed concrete types. Ideally, we
    // would set the type to diff(string, set of listed concrete types), but
    // this doesn't exist in Flow at the time.
    types.push(
      Array.from(typenameAliases).map(typenameAlias => {
        const otherProp = readOnlyObjectTypeProperty(
          typenameAlias,
          ts.createLiteralTypeNode(ts.createLiteral("%other"))
        );
        const otherPropWithComment = ts.addSyntheticLeadingComment(
          otherProp,
          ts.SyntaxKind.MultiLineCommentTrivia,
          "This will never be '%other', but we need some\n" +
            "value in case none of the concrete values match.",
          true
        );
        return otherPropWithComment;
      })
    );
  } else {
    let selectionMap = selectionsToMap(Array.from(baseFields.values()));
    for (const concreteType in byConcreteType) {
      selectionMap = mergeSelections(
        selectionMap,
        selectionsToMap(
          byConcreteType[concreteType].map(sel => ({
            ...sel,
            conditional: true
          }))
        )
      );
    }
    const selectionMapValues = groupRefs(Array.from(selectionMap.values())).map(
      sel =>
        isTypenameSelection(sel) && sel.concreteType
          ? makeProp(
              {
                ...sel,
                conditional: false
              },
              state,
              unmasked,
              sel.concreteType
            )
          : makeProp(sel, state, unmasked)
    );
    types.push(selectionMapValues);
  }

  const typeElements = types.map(props => {
    if (fragmentTypeName) {
      props.push(
        readOnlyObjectTypeProperty(
          REF_TYPE,
          ts.createTypeReferenceNode(
            ts.createIdentifier(fragmentTypeName),
            undefined
          )
        )
      );
    }
    return unmasked
      ? ts.createTypeLiteralNode(props)
      : exactObjectTypeAnnotation(props);
  });
  if (typeElements.length === 1) {
    return typeElements[0];
  }
  return ts.createUnionTypeNode(typeElements);
}

// We don't have exact object types in typescript.
function exactObjectTypeAnnotation(
  properties: ts.PropertySignature[]
): ts.TypeLiteralNode {
  return ts.createTypeLiteralNode(properties);
}

const idRegex = /^[$a-zA-Z_][$a-z0-9A-Z_]*$/;

function readOnlyObjectTypeProperty(
  propertyName: string,
  type: ts.TypeNode,
  optional?: boolean
): ts.PropertySignature {
  return ts.createPropertySignature(
    [ts.createToken(ts.SyntaxKind.ReadonlyKeyword)],
    idRegex.test(propertyName)
      ? ts.createIdentifier(propertyName)
      : ts.createLiteral(propertyName),
    optional ? ts.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    type,
    undefined
  );
}

function mergeSelection(
  a: Selection | null | undefined,
  b: Selection
): Selection {
  if (!a) {
    return {
      ...b,
      conditional: true
    };
  }
  return {
    ...a,
    nodeSelections: a.nodeSelections
      ? mergeSelections(a.nodeSelections, nullthrows(b.nodeSelections))
      : null,
    conditional: a.conditional && b.conditional
  };
}

function mergeSelections(a: SelectionMap, b: SelectionMap): SelectionMap {
  const merged = new Map();
  for (const [key, value] of Array.from(a.entries())) {
    merged.set(key, value);
  }
  for (const [key, value] of Array.from(b.entries())) {
    merged.set(key, mergeSelection(a.get(key), value));
  }
  return merged;
}

function isPlural(node: Fragment): boolean {
  return Boolean(node.metadata && node.metadata.plural);
}

function exportType(name: string, type: ts.TypeNode) {
  return ts.createTypeAliasDeclaration(
    undefined,
    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.createIdentifier(name),
    undefined,
    type
  );
}

function importTypes(names: string[], fromModule: string): ts.Statement {
  return ts.createImportDeclaration(
    undefined,
    undefined,
    ts.createImportClause(
      undefined,
      ts.createNamedImports(
        names.map(name =>
          ts.createImportSpecifier(undefined, ts.createIdentifier(name))
        )
      )
    ),
    ts.createLiteral(fromModule)
  );
}

function createVisitor(options: TypeGeneratorOptions) {
  const state: State = {
    customScalars: options.customScalars,
    enumsHasteModule: options.enumsHasteModule,
    existingFragmentNames: options.existingFragmentNames,
    generatedInputObjectTypes: {},
    generatedFragments: new Set(),
    optionalInputFields: options.optionalInputFields,
    relayRuntimeModule: options.relayRuntimeModule,
    usedEnums: {},
    usedFragments: new Set(),
    useHaste: options.useHaste,
    useSingleArtifactDirectory: options.useSingleArtifactDirectory,
    noFutureProofEnums: options.noFutureProofEnums,
    matchFields: new Map()
  };

  return {
    leave: {
      Root(node: Root) {
        const inputVariablesType = generateInputVariablesType(node, state);
        const inputObjectTypes = generateInputObjectTypes(state);
        const responseType = exportType(
          `${node.name}Response`,
          // From flow code: $FlowFixMe: selections have already been transformed
          selectionsToAST(
            (node.selections as any) as Selection[][],
            state,
            false
          )
        );
        const operationType = exportType(
          node.name,
          ts.createTypeLiteralNode([
            readOnlyObjectTypeProperty(
              "response",
              ts.createTypeReferenceNode(responseType.name, undefined)
            ),
            readOnlyObjectTypeProperty(
              "variables",
              ts.createTypeReferenceNode(inputVariablesType.name, undefined)
            )
          ])
        );
        return [
          ...getFragmentImports(state),
          ...getEnumDefinitions(state),
          ...inputObjectTypes,
          inputVariablesType,
          responseType,
          operationType
        ];
      },

      Fragment(node: Fragment) {
        // From flow code: $FlowFixMe: selections have already been transformed
        const flattenedSelections: Selection[] = flattenArray(
          (node.selections as any) as Selection[][]
        );
        const numConcreteSelections = flattenedSelections.filter(
          s => s.concreteType
        ).length;
        const selections = flattenedSelections.map(selection => {
          if (
            numConcreteSelections <= 1 &&
            isTypenameSelection(selection) &&
            !isAbstractType(node.type)
          ) {
            return [
              {
                ...selection,
                concreteType: node.type.toString()
              }
            ];
          }
          return [selection];
        });
        state.generatedFragments.add(node.name);
        const fragmentTypes = getFragmentTypes(
          node.name,
          options.useSingleArtifactDirectory
        );

        const dataType = ts.createTypeReferenceNode(node.name, undefined);

        const unmasked = node.metadata != null && node.metadata.mask === false;
        const baseType = selectionsToAST(
          selections,
          state,
          unmasked,
          unmasked ? undefined : getOldFragmentTypeName(node.name)
        );
        const type = isPlural(node)
          ? ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
              baseType
            ])
          : baseType;

        return [
          ...getFragmentImports(state),
          ...getEnumDefinitions(state),
          ...fragmentTypes,
          exportType(node.name, type)
        ];
      },
      InlineFragment(node: InlineFragment) {
        const typeCondition = node.typeCondition;
        // From flow code: $FlowFixMe: selections have already been transformed
        return flattenArray((node.selections as any) as Selection[][]).map(
          typeSelection => {
            return isAbstractType(typeCondition)
              ? {
                  ...typeSelection,
                  conditional: true
                }
              : {
                  ...typeSelection,
                  concreteType: typeCondition.toString()
                };
          }
        );
      },
      Condition(node: Condition) {
        return flattenArray((node.selections as any) as Selection[][]).map(
          selection => {
            return {
              ...selection,
              conditional: true
            };
          }
        );
      },
      ScalarField(node: ScalarField) {
        return [
          {
            key: node.alias == null ? node.name : node.alias,
            schemaName: node.name,
            value: transformScalarType(node.type, state)
          }
        ];
      },
      LinkedField(node: LinkedField) {
        return [
          {
            key: node.alias == null ? node.name : node.alias,
            schemaName: node.name,
            nodeType: node.type,
            nodeSelections: selectionsToMap(
              flattenArray((node.selections as any) as Selection[][]),
              /*
               * append concreteType to key so overlapping fields with different
               * concreteTypes don't get overwritten by each other
               */
              true
            )
          }
        ];
      },
      ModuleImport(node: ModuleImport) {
        return [
          {
            key: "__fragmentPropName",
            conditional: true,
            value: transformScalarType(GraphQLString, state)
          },
          {
            key: "__module_component",
            conditional: true,
            value: transformScalarType(GraphQLString, state)
          },
          {
            key: "__fragments_" + node.name,
            ref: node.name
          }
        ];
      },
      FragmentSpread(node: FragmentSpread) {
        state.usedFragments.add(node.name);
        return [
          {
            key: "__fragments_" + node.name,
            ref: node.name
          }
        ];
      }
    }
  };
}

function selectionsToMap(
  selections: Selection[],
  appendType?: boolean
): SelectionMap {
  const map = new Map();
  selections.forEach(selection => {
    const key =
      appendType && selection.concreteType
        ? `${selection.key}::${selection.concreteType}`
        : selection.key;
    const previousSel = map.get(key);
    map.set(
      key,
      previousSel ? mergeSelection(previousSel, selection) : selection
    );
  });
  return map;
}

function flattenArray<T>(arrayOfArrays: T[][]): T[] {
  const result: T[] = [];
  arrayOfArrays.forEach(array => result.push(...array));
  return result;
}

function generateInputObjectTypes(state: State) {
  return Object.keys(state.generatedInputObjectTypes).map(typeIdentifier => {
    const inputObjectType = state.generatedInputObjectTypes[typeIdentifier];
    if (inputObjectType === "pending") {
      throw new Error(
        "TypeScriptGenerator: Expected input object type to have been" +
          " defined before calling `generateInputObjectTypes`"
      );
    } else {
      return exportType(typeIdentifier, inputObjectType);
    }
  });
}

function generateInputVariablesType(node: Root, state: State) {
  return exportType(
    `${node.name}Variables`,
    exactObjectTypeAnnotation(
      node.argumentDefinitions.map(arg => {
        return readOnlyObjectTypeProperty(
          arg.name,
          transformInputType(arg.type, state),
          !(arg.type instanceof GraphQLNonNull)
        );
      })
    )
  );
}

function groupRefs(props: Selection[]): Selection[] {
  const result: Selection[] = [];
  const refs: string[] = [];
  props.forEach(prop => {
    if (prop.ref) {
      refs.push(prop.ref);
    } else {
      result.push(prop);
    }
  });
  if (refs.length > 0) {
    const value = ts.createIntersectionTypeNode(
      refs.map(ref =>
        ts.createTypeReferenceNode(
          ts.createIdentifier(getOldFragmentTypeName(ref)),
          undefined
        )
      )
    );
    result.push({
      key: FRAGMENT_REFS,
      conditional: false,
      value
    });
  }
  return result;
}

function createAnyTypeAlias(name: string): ts.TypeAliasDeclaration {
  return ts.createTypeAliasDeclaration(
    undefined,
    undefined,
    ts.createIdentifier(name),
    undefined,
    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
  );
}

function getFragmentImports(state: State) {
  const imports: ts.Statement[] = [];
  if (state.usedFragments.size > 0) {
    const usedFragments = Array.from(state.usedFragments).sort();
    for (const usedFragment of usedFragments) {
      const fragmentTypeName = getOldFragmentTypeName(usedFragment);
      if (
        !state.generatedFragments.has(usedFragment) &&
        state.useSingleArtifactDirectory &&
        state.existingFragmentNames.has(usedFragment)
      ) {
        imports.push(
          importTypes([fragmentTypeName], `./${usedFragment}.graphql`)
        );
      } else {
        imports.push(createAnyTypeAlias(fragmentTypeName));
      }
    }
  }
  return imports;
}

function getEnumDefinitions({
  enumsHasteModule,
  usedEnums,
  noFutureProofEnums
}: State) {
  const enumNames = Object.keys(usedEnums).sort();
  if (enumNames.length === 0) {
    return [];
  }
  if (typeof enumsHasteModule === "string") {
    return [importTypes(enumNames, enumsHasteModule)];
  }
  if (typeof enumsHasteModule === "function") {
    return enumNames.map(enumName =>
      importTypes([enumName], enumsHasteModule(enumName))
    );
  }
  return enumNames.map(name => {
    const values = usedEnums[name].getValues().map(({ value }) => value);
    values.sort();
    if (!noFutureProofEnums) {
      values.push("%future added value");
    }
    return exportType(
      name,
      ts.createUnionTypeNode(
        values.map(value => stringLiteralTypeAnnotation(value))
      )
    );
  });
}

function stringLiteralTypeAnnotation(name: string): ts.TypeNode {
  return ts.createLiteralTypeNode(ts.createLiteral(name));
}

function getFragmentTypes(name: string, useSingleArtifactDirectory: boolean) {
  const oldFragmentTypeName = getOldFragmentTypeName(name);

  if (!useSingleArtifactDirectory) {
    return [
      exportType(
        oldFragmentTypeName,
        ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
      )
    ];
  }

  const _refTypeName = `_${oldFragmentTypeName}`;
  const _refType = ts.createVariableStatement(
    [ts.createToken(ts.SyntaxKind.DeclareKeyword)],
    ts.createVariableDeclarationList(
      [
        ts.createVariableDeclaration(
          _refTypeName,
          ts.createTypeOperatorNode(
            ts.SyntaxKind.UniqueKeyword,
            ts.createKeywordTypeNode(ts.SyntaxKind.SymbolKeyword)
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  return [
    _refType,
    exportType(
      oldFragmentTypeName,
      ts.createTypeQueryNode(ts.createIdentifier(_refTypeName))
    )
  ];
}

function getOldFragmentTypeName(name: string) {
  return `${name}$ref`;
}

// Should match FLOW_TRANSFORMS array
// https://github.com/facebook/relay/blob/v4.0.0/packages/relay-compiler/language/javascript/RelayFlowGenerator.js#L621-L627
export const transforms: TypeGenerator["transforms"] = [
  IRTransforms.commonTransforms[1], // RelayRelayDirectiveTransform.transform,
  IRTransforms.commonTransforms[2], // RelayMaskTransform.transform,
  IRTransforms.commonTransforms[0], // RelayConnectionTransform.transform,
  IRTransforms.commonTransforms[3], // RelayMatchTransform.transform,
  IRTransforms.printTransforms[3], // FlattenTransform.transformWithOptions({}),
  IRTransforms.commonTransforms[4] // RelayRefetchableFragmentTransform.transform,
];
