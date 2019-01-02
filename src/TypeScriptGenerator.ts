import { IRTransforms, TypeGenerator } from "relay-compiler";

import * as path from "path";
import * as ts from "typescript";

import {
  GraphQLEnumType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLType
} from "graphql";
import {
  ScalarTypeMapping,
  State,
  transformInputType,
  transformScalarType
} from "./TypeScriptTypeTransformers";

// Get the types
import * as GraphQLCompilerTypes from "graphql-compiler";
// Load the actual code with a fallback to < Relay 1.6 which changed graphql-compiler to an actual package.
let GraphQLCompiler: typeof GraphQLCompilerTypes;
try {
  GraphQLCompiler = require("relay-compiler/lib/GraphQLCompilerPublic");
} catch (err) {
  GraphQLCompiler = require("graphql-compiler");
}
const { IRVisitor, SchemaUtils } = GraphQLCompiler;

import { TypeGeneratorOptions } from "relay-compiler";

const { isAbstractType } = SchemaUtils;

const REF_TYPE = " $refType";
const FRAGMENT_REFS = " $fragmentRefs";

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
  concreteType?: string
): ts.PropertySignature {
  let { value } = selection;
  const { key, schemaName, conditional, nodeType, nodeSelections } = selection;
  if (nodeType) {
    value = transformScalarType(
      nodeType,
      state,
      selectionsToAST([Array.from(nullthrows(nodeSelections).values())], state)
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
  refTypeName?: string
): ts.TypeNode {
  const baseFields = new Map();
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
    Object.keys(byConcreteType).length &&
    onlySelectsTypename(Array.from(baseFields.values())) &&
    (hasTypenameSelection(Array.from(baseFields.values())) ||
      Object.keys(byConcreteType).every(type =>
        hasTypenameSelection(byConcreteType[type])
      ))
  ) {
    for (const concreteType in byConcreteType) {
      types.push(
        groupRefs([
          ...Array.from(baseFields.values()),
          ...byConcreteType[concreteType]
        ]).map(selection => makeProp(selection, state, concreteType))
      );
    }
    // It might be some other type than the listed concrete types. Ideally, we
    // would set the type to diff(string, set of listed concrete types), but
    // this doesn't exist in Flow at the time.
    const otherProp = readOnlyObjectTypeProperty(
      "__typename",
      ts.createLiteralTypeNode(ts.createLiteral("%other"))
    );
    const otherPropWithComment = ts.addSyntheticLeadingComment(
      otherProp,
      ts.SyntaxKind.MultiLineCommentTrivia,
      "This will never be '% other', but we need some\n" +
        "value in case none of the concrete values match.",
      true
    );
    types.push([otherPropWithComment]);
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
          ? makeProp({ ...sel, conditional: false }, state, sel.concreteType)
          : makeProp(sel, state)
    );
    types.push(selectionMapValues);
  }

  return ts.createUnionTypeNode(
    types.map(props => {
      if (refTypeName) {
        props.push(
          readOnlyObjectTypeProperty(
            REF_TYPE,
            ts.createTypeReferenceNode(
              ts.createIdentifier(refTypeName),
              undefined
            )
          )
        );
      }
      return exactObjectTypeAnnotation(props);
    })
  );
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

function isPlural(node: GraphQLCompilerTypes.Fragment): boolean {
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
    noFutureProofEnums: options.noFutureProofEnums
  };

  return {
    leave: {
      Root(node: any) {
        const inputVariablesType = generateInputVariablesType(node, state);
        const inputObjectTypes = generateInputObjectTypes(state);
        const responseType = exportType(
          `${node.name}Response`,
          selectionsToAST(node.selections, state)
        );
        const operationType = exportType(
          node.name,
          exactObjectTypeAnnotation([
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

      Fragment(node: any) {
        const flattenedSelections: Selection[] = flattenArray(node.selections);
        const numConecreteSelections = flattenedSelections.filter(
          s => s.concreteType
        ).length;
        const selections = flattenedSelections.map(selection => {
          if (
            numConecreteSelections <= 1 &&
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
        const refTypeName = getRefTypeName(node.name);
        const refTypeNodes: ts.Node[] = [];
        if (options.useSingleArtifactDirectory) {
          const _refTypeName = `_${refTypeName}`;
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
          const refType = exportType(
            refTypeName,
            ts.createTypeQueryNode(ts.createIdentifier(_refTypeName))
          );
          refTypeNodes.push(_refType);
          refTypeNodes.push(refType);
        } else {
          const refType = exportType(
            refTypeName,
            ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
          );
          refTypeNodes.push(refType);
        }
        const baseType = selectionsToAST(selections, state, refTypeName);
        const type = isPlural(node)
          ? ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
              baseType
            ])
          : baseType;
        return [
          ...getFragmentImports(state),
          ...getEnumDefinitions(state),
          ...refTypeNodes,
          exportType(node.name, type)
        ];
      },

      InlineFragment(node: any) {
        const typeCondition = node.typeCondition;
        return flattenArray(node.selections).map(typeSelection => {
          return isAbstractType(typeCondition)
            ? {
                ...typeSelection,
                conditional: true
              }
            : {
                ...typeSelection,
                concreteType: typeCondition.toString()
              };
        });
      },
      Condition(node: any) {
        return flattenArray(node.selections).map(selection => {
          return {
            ...selection,
            conditional: true
          };
        });
      },
      ScalarField(node: any) {
        return [
          {
            key: node.alias || node.name,
            schemaName: node.name,
            value: transformScalarType(node.type, state)
          }
        ];
      },
      LinkedField(node: any) {
        return [
          {
            key: node.alias || node.name,
            schemaName: node.name,
            nodeType: node.type,
            nodeSelections: selectionsToMap(flattenArray(node.selections))
          }
        ];
      },
      FragmentSpread(node: any) {
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

function selectionsToMap(selections: Selection[]): SelectionMap {
  const map = new Map();
  selections.forEach(selection => {
    const previousSel = map.get(selection.key);
    map.set(
      selection.key,
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

function generateInputVariablesType(
  node: GraphQLCompilerTypes.Root,
  state: State
) {
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
          ts.createIdentifier(getRefTypeName(ref)),
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
      const refTypeName = getRefTypeName(usedFragment);
      if (
        !state.generatedFragments.has(usedFragment) &&
        state.useSingleArtifactDirectory &&
        state.existingFragmentNames.has(usedFragment)
      ) {
        imports.push(importTypes([refTypeName], `./${usedFragment}.graphql`));
      } else {
        imports.push(createAnyTypeAlias(refTypeName));
      }
    }
  }
  return imports;
}

function anyTypeAlias(typeName: string): ts.Statement {
  return ts.createTypeAliasDeclaration(
    undefined,
    undefined,
    ts.createIdentifier(typeName),
    undefined,
    ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
  );
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
  if (enumsHasteModule) {
    return [importTypes(enumNames, enumsHasteModule)];
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

function getRefTypeName(name: string): string {
  return `${name}$ref`;
}

export const transforms: TypeGenerator["transforms"] = [
  IRTransforms.commonTransforms[2], // RelayRelayDirectiveTransform.transform
  IRTransforms.commonTransforms[3], // RelayMaskTransform.transform
  IRTransforms.printTransforms[0] // FlattenTransform.transformWithOptions({})
];
