import {
  Condition,
  createUserError,
  Fragment,
  IRVisitor,
  LinkedField,
  Root,
  ScalarField,
  Schema,
  TypeGenerator,
  TypeID
} from "relay-compiler";
import { ConnectionField } from "relay-compiler/lib/core/GraphQLIR";
import { TypeGeneratorOptions } from "relay-compiler/lib/language/RelayLanguagePluginInterface";
import * as ConnectionFieldTransform from "relay-compiler/lib/transforms/ConnectionFieldTransform";
import * as FlattenTransform from "relay-compiler/lib/transforms/FlattenTransform";
import * as MaskTransform from "relay-compiler/lib/transforms/MaskTransform";
import * as MatchTransform from "relay-compiler/lib/transforms/MatchTransform";
import * as RefetchableFragmentTransform from "relay-compiler/lib/transforms/RefetchableFragmentTransform";
import * as RelayDirectiveTransform from "relay-compiler/lib/transforms/RelayDirectiveTransform";
import { ConnectionInterface } from "relay-runtime";
import * as ts from "typescript";
import {
  State,
  transformInputType,
  transformScalarType
} from "./TypeScriptTypeTransformers";

type Selection = {
  key: string;
  schemaName?: string;
  value?: any;
  nodeType?: TypeID | "MODULE_IMPORT_FIELD";
  conditional?: boolean;
  concreteType?: string;
  ref?: string;
  nodeSelections?: SelectionMap | null;
};

type SelectionMap = Map<string, Selection>;

const REF_TYPE = " $refType";
const FRAGMENT_REFS = " $fragmentRefs";
const DATA_REF = " $data";
const FRAGMENT_REFS_TYPE_NAME = "FragmentRefs";
const MODULE_IMPORT_FIELD = "MODULE_IMPORT_FIELD";
const DIRECTIVE_NAME = "raw_response_type";

export const generate: TypeGenerator["generate"] = (schema, node, options) => {
  const ast: ts.Statement[] = IRVisitor.visit(
    node,
    createVisitor(schema, options)
  );

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const resultFile = ts.createSourceFile(
    "grapghql-def.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );

  const fullProgramAst = ts.updateSourceFileNode(resultFile, ast);

  return printer.printNode(ts.EmitHint.SourceFile, fullProgramAst, resultFile);
};

function nullthrows<T>(obj: T | null | undefined): T {
  if (obj == null) {
    throw new Error("Obj is null");
  }
  return obj;
}

function makeProp(
  schema: Schema,
  selection: Selection,
  state: State,
  unmasked: boolean,
  concreteType?: string
): ts.PropertySignature {
  let { value } = selection;

  const { key, schemaName, conditional, nodeType, nodeSelections } = selection;

  if (nodeType && nodeType !== MODULE_IMPORT_FIELD) {
    value = transformScalarType(
      schema,
      nodeType,
      state,
      selectionsToAST(
        schema,
        [Array.from(nullthrows(nodeSelections).values())],
        state,
        unmasked
      )
    );
  }

  if (schemaName === "__typename" && concreteType) {
    value = ts.createLiteralTypeNode(ts.createLiteral(concreteType));
  }

  return objectTypeProperty(key, value, { optional: conditional });
}

const isTypenameSelection = (selection: Selection) =>
  selection.schemaName === "__typename";

const hasTypenameSelection = (selections: Selection[]) =>
  selections.some(isTypenameSelection);

const onlySelectsTypename = (selections: Selection[]) =>
  selections.every(isTypenameSelection);

function selectionsToAST(
  schema: Schema,
  selections: ReadonlyArray<ReadonlyArray<Selection>>,
  state: State,
  unmasked: boolean,
  fragmentTypeName?: string
) {
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
    Object.keys(byConcreteType).length &&
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
          return makeProp(schema, selection, state, unmasked, concreteType);
        })
      );
    }

    // It might be some other type then the listed concrete types. Ideally, we
    // would set the type to diff(string, set of listed concrete types), but
    // this doesn't exist in Flow at the time.
    types.push(
      Array.from(typenameAliases).map(typenameAlias => {
        const otherProp = objectTypeProperty(
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
              schema,
              {
                ...sel,
                conditional: false
              },
              state,
              unmasked,
              sel.concreteType
            )
          : makeProp(schema, sel, state, unmasked)
    );

    types.push(selectionMapValues);
  }

  const typeElements = types.map(props => {
    if (fragmentTypeName) {
      props.push(
        objectTypeProperty(
          REF_TYPE,
          ts.createLiteralTypeNode(ts.createStringLiteral(fragmentTypeName))
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

function objectTypeProperty(
  propertyName: string,
  type: ts.TypeNode,
  options: { readonly?: boolean; optional?: boolean } = {}
): ts.PropertySignature {
  const { optional, readonly = true } = options;
  const modifiers = readonly
    ? [ts.createToken(ts.SyntaxKind.ReadonlyKeyword)]
    : undefined;

  return ts.createPropertySignature(
    modifiers,
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
  b: Selection,
  shouldSetConditional: boolean = true
): Selection {
  if (!a) {
    if (shouldSetConditional) {
      return {
        ...b,
        conditional: true
      };
    }

    return b;
  }

  return {
    ...a,
    nodeSelections: a.nodeSelections
      ? mergeSelections(
          a.nodeSelections,
          nullthrows(b.nodeSelections),
          shouldSetConditional
        )
      : null,
    conditional: a.conditional && b.conditional
  };
}

function mergeSelections(
  a: SelectionMap,
  b: SelectionMap,
  shouldSetConditional: boolean = true
): SelectionMap {
  const merged = new Map();

  for (const [key, value] of Array.from(a.entries())) {
    merged.set(key, value);
  }

  for (const [key, value] of Array.from(b.entries())) {
    merged.set(key, mergeSelection(a.get(key), value, shouldSetConditional));
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
  return (
    names &&
    ts.createImportDeclaration(
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
    )
  );
}

function createVisitor(
  schema: Schema,
  options: TypeGeneratorOptions
): IRVisitor.NodeVisitor {
  const state: State = {
    customScalars: options.customScalars,
    enumsHasteModule: options.enumsHasteModule,
    existingFragmentNames: options.existingFragmentNames,
    generatedInputObjectTypes: {},
    generatedFragments: new Set(),
    hasConnectionResolver: false,
    optionalInputFields: options.optionalInputFields,
    usedEnums: {},
    usedFragments: new Set(),
    useHaste: options.useHaste,
    useSingleArtifactDirectory: options.useSingleArtifactDirectory,
    noFutureProofEnums: options.noFutureProofEnums,
    matchFields: new Map(),
    runtimeImports: new Set()
  };

  return {
    leave: {
      Root(node) {
        const inputVariablesType = generateInputVariablesType(
          schema,
          node,
          state
        );

        const inputObjectTypes = generateInputObjectTypes(state);

        const responseType = exportType(
          `${node.name}Response`,
          selectionsToAST(
            schema,
            /* $FlowFixMe: selections have already been transformed */
            (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>,
            state,
            false
          )
        );

        const operationTypes = [
          objectTypeProperty(
            "response",
            ts.createTypeReferenceNode(responseType.name, undefined)
          ),
          objectTypeProperty(
            "variables",
            ts.createTypeReferenceNode(inputVariablesType.name, undefined)
          )
        ];

        // Generate raw response type
        let rawResponseType;

        const { normalizationIR } = options;

        if (
          normalizationIR &&
          node.directives.some(d => d.name === DIRECTIVE_NAME)
        ) {
          rawResponseType = IRVisitor.visit(
            normalizationIR,
            createRawResponseTypeVisitor(schema, state)
          );
        }

        const nodes = [
          ...getFragmentRefsTypeImport(state),
          ...getEnumDefinitions(schema, state),
          ...inputObjectTypes,
          inputVariablesType,
          responseType
        ];

        if (rawResponseType) {
          for (const [key, ast] of state.matchFields) {
            nodes.push(
              ts.createTypeAliasDeclaration(
                undefined,
                undefined,
                key,
                undefined,
                ast
              )
            );
          }

          operationTypes.push(
            objectTypeProperty(
              "rawResponse",
              ts.createTypeReferenceNode(`${node.name}RawResponse`, undefined)
            )
          );

          nodes.push(rawResponseType);
        }
        nodes.push(
          exportType(node.name, exactObjectTypeAnnotation(operationTypes))
        );
        return nodes;
      },

      Fragment(node) {
        const flattenedSelections: Selection[] = flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>
        );

        const numConcreteSelections = flattenedSelections.filter(
          s => s.concreteType
        ).length;

        const selections = flattenedSelections.map(selection => {
          if (
            numConcreteSelections <= 1 &&
            isTypenameSelection(selection) &&
            !schema.isAbstractType(node.type)
          ) {
            return [
              {
                ...selection,
                concreteType: schema.getTypeString(node.type)
              }
            ];
          }

          return [selection];
        });

        state.generatedFragments.add(node.name);

        const refTypeName = getRefTypeName(node.name);
        const refTypeDataProperty = objectTypeProperty(
          DATA_REF,
          ts.createTypeReferenceNode(`${node.name}$data`, undefined)
        );
        refTypeDataProperty.questionToken = ts.createToken(
          ts.SyntaxKind.QuestionToken
        );
        const refTypeFragmentRefProperty = objectTypeProperty(
          FRAGMENT_REFS,
          ts.createTypeReferenceNode(FRAGMENT_REFS_TYPE_NAME, [
            ts.createLiteralTypeNode(ts.createStringLiteral(node.name))
          ])
        );
        const isPluralFragment = isPlural(node);
        const refType = exactObjectTypeAnnotation([
          refTypeDataProperty,
          refTypeFragmentRefProperty
        ]);

        const dataTypeName = getDataTypeName(node.name);
        const dataType = ts.createTypeReferenceNode(node.name, undefined);

        const unmasked = node.metadata != null && node.metadata.mask === false;

        const baseType = selectionsToAST(
          schema,
          selections,
          state,
          unmasked,
          unmasked ? undefined : node.name
        );

        const type = isPlural(node)
          ? ts.createTypeReferenceNode(ts.createIdentifier("ReadonlyArray"), [
              baseType
            ])
          : baseType;
        state.runtimeImports.add("FragmentRefs");

        return [
          ...getEnumDefinitions(schema, state),
          importTypes(Array.from(state.runtimeImports).sort(), "relay-runtime"),
          exportType(node.name, type),
          exportType(dataTypeName, dataType),
          exportType(
            refTypeName,
            isPluralFragment
              ? ts.createTypeReferenceNode(
                  ts.createIdentifier("ReadonlyArray"),
                  [refType]
                )
              : refType
          )
        ];
      },
      InlineFragment(node) {
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>
        ).map(typeSelection => {
          return schema.isAbstractType(node.typeCondition)
            ? {
                ...typeSelection,
                conditional: true
              }
            : {
                ...typeSelection,
                concreteType: schema.getTypeString(node.typeCondition)
              };
        });
      },
      Condition: visitCondition,
      // TODO: Why not inline it like others?
      ScalarField(node) {
        return visitScalarField(schema, node, state);
      },
      ConnectionField: visitLinkedField,
      LinkedField: visitLinkedField,
      Connection(node) {
        return visitConnection(schema, node, state);
      },
      ModuleImport(node) {
        return [
          {
            key: "__fragmentPropName",
            conditional: true,
            value: transformScalarType(schema, schema.expectStringType(), state)
          },
          {
            key: "__module_component",
            conditional: true,
            value: transformScalarType(schema, schema.expectStringType(), state)
          },
          {
            key: "__fragments_" + node.name,
            ref: node.name
          }
        ];
      },
      FragmentSpread(node) {
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

function visitConnection(schema: Schema, node: any, state: State) {
  const { EDGES } = ConnectionInterface.get();

  state.hasConnectionResolver = true;

  const edgesSelection = node.selections.find((selections: any) => {
    return (
      Array.isArray(selections) &&
      selections.some(
        selection =>
          selection != null &&
          typeof selection === "object" &&
          selection.key === EDGES &&
          selection.schemaName === EDGES
      )
    );
  });

  const edgesItem = Array.isArray(edgesSelection) ? edgesSelection[0] : null;

  const nodeSelections =
    edgesItem != null &&
    typeof edgesItem === "object" &&
    edgesItem.nodeSelections instanceof Map
      ? edgesItem.nodeSelections
      : null;

  if (nodeSelections == null) {
    throw createUserError(
      "Cannot generate flow types for connection field, expected an edges " +
        "selection.",
      [node.loc]
    );
  }

  const edgesFields = Array.from(nodeSelections.values()) as any[];

  const edgesType = selectionsToAST(schema, [edgesFields], state, false);

  return [
    {
      key: "__connection",
      conditional: true,
      value: ts.createTypeReferenceNode("ConnectionReference", [edgesType])
    }
  ];
}

function visitCondition(node: Condition) {
  return flattenArray(
    /* $FlowFixMe: selections have already been transformed */
    (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>
  ).map(selection => {
    return {
      ...selection,
      conditional: true
    };
  });
}

function visitScalarField(schema: Schema, node: ScalarField, state: State) {
  return [
    {
      key: node.alias || node.name,
      schemaName: node.name,
      value: transformScalarType(schema, node.type, state)
    }
  ];
}

function visitLinkedField(node: LinkedField | ConnectionField) {
  return [
    {
      key: node.alias || node.name,
      schemaName: node.name,
      nodeType: node.type,
      nodeSelections: selectionsToMap(
        flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>
        ),
        /*
         * append concreteType to key so overlapping fields with different
         * concreteTypes don't get overwritten by each other
         */
        true
      )
    }
  ];
}

function makeRawResponseProp(
  schema: Schema,
  { key, schemaName, value, conditional, nodeType, nodeSelections }: Selection,
  state: State,
  concreteType: string | null
) {
  if (nodeType) {
    if (nodeType === MODULE_IMPORT_FIELD) {
      // TODO: In flow one can extend an object type with spread, with TS we need an intersection (&)
      // return ts.createSpread(ts.createIdentifier(key));
      throw new Error("TODO!");
    }

    value = transformScalarType(
      schema,
      nodeType,
      state,
      selectionsToRawResponseBabel(
        schema,
        [Array.from(nullthrows(nodeSelections).values())],
        state,
        schema.isAbstractType(nodeType) ? null : nodeType.name
      )
    );
  }

  if (schemaName === "__typename" && concreteType) {
    value = ts.createLiteralTypeNode(ts.createLiteral(concreteType));
  }

  const typeProperty = objectTypeProperty(key, value);

  if (conditional) {
    typeProperty.questionToken = ts.createToken(ts.SyntaxKind.QuestionToken);
  }

  return typeProperty;
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

// Transform the codegen IR selections into TS types
function selectionsToRawResponseBabel(
  schema: Schema,
  selections: ReadonlyArray<ReadonlyArray<Selection>>,
  state: State,
  nodeTypeName: string | null
) {
  const baseFields: any[] = [];
  const byConcreteType: Record<string, any> = {};

  flattenArray(selections).forEach(selection => {
    const { concreteType } = selection;

    if (concreteType) {
      byConcreteType[concreteType] = byConcreteType[concreteType] || [];
      byConcreteType[concreteType].push(selection);
    } else {
      baseFields.push(selection);
    }
  });

  const types: ts.PropertySignature[][] = [];

  if (Object.keys(byConcreteType).length) {
    const baseFieldsMap = selectionsToMap(baseFields);

    for (const concreteType in byConcreteType) {
      types.push(
        Array.from(
          mergeSelections(
            baseFieldsMap,
            selectionsToMap(byConcreteType[concreteType]),
            false
          ).values()
        ).map(selection => {
          if (isTypenameSelection(selection)) {
            return makeRawResponseProp(
              schema,
              { ...selection, conditional: false },
              state,
              concreteType
            );
          }

          return makeRawResponseProp(schema, selection, state, concreteType);
        })
      );
    }
  }
  if (baseFields.length) {
    types.push(
      baseFields.map(selection => {
        if (isTypenameSelection(selection)) {
          return makeRawResponseProp(
            schema,
            { ...selection, conditional: false },
            state,
            nodeTypeName
          );
        }

        return makeRawResponseProp(schema, selection, state, null);
      })
    );
  }

  return ts.createUnionTypeNode(
    types.map(props => exactObjectTypeAnnotation(props))
  );
}

// Visitor for generating raw response type
function createRawResponseTypeVisitor(
  schema: Schema,
  state: State
): IRVisitor.NodeVisitor {
  return {
    leave: {
      Root(node) {
        return exportType(
          `${node.name}RawResponse`,
          selectionsToRawResponseBabel(
            schema,
            /* $FlowFixMe: selections have already been transformed */
            (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>,
            state,
            null
          )
        );
      },
      InlineFragment(node) {
        const typeCondition = node.typeCondition;

        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>
        ).map(typeSelection => {
          return schema.isAbstractType(typeCondition)
            ? typeSelection
            : {
                ...typeSelection,
                concreteType: schema.getTypeString(typeCondition)
              };
        });
      },
      Condition: visitCondition,
      ScalarField(node) {
        return visitScalarField(schema, node, state);
      },
      ConnectionField: visitLinkedField,
      LinkedField: visitLinkedField,
      Connection(node) {
        return visitConnection(schema, node, state);
      },
      ClientExtension(node) {
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>
        ).map(sel => ({
          ...sel,
          conditional: true
        }));
      },
      Defer(node) {
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>
        );
      },
      Stream(node) {
        return flattenArray(
          /* $FlowFixMe: selections have already been transformed */
          (node.selections as any) as ReadonlyArray<ReadonlyArray<Selection>>
        );
      },
      ModuleImport(node, state) {
        return visitRawResponseModuleImport(schema, node, state);
      },
      FragmentSpread(_node) {
        throw new Error(
          "A fragment spread is found when traversing the AST, " +
            "make sure you are passing the codegen IR"
        );
      }
    }
  };
}

// Dedupe the generated type of module selections to reduce file size
function visitRawResponseModuleImport(
  schema: Schema,
  node: any,
  state: State
): Selection[] {
  const { selections, name: key } = node;

  const moduleSelections = selections
    .filter((sel: any) => sel.length && sel[0].schemaName === "js")
    .map((arr: any[]) => arr[0]);

  if (!state.matchFields.has(key)) {
    const ast = selectionsToRawResponseBabel(
      schema,
      node.selections.filter(
        (sel: any) => sel.length > 1 || sel[0].schemaName !== "js"
      ),
      state,
      null
    );

    state.matchFields.set(key, ast);
  }

  return [
    ...moduleSelections,
    {
      key,
      nodeType: MODULE_IMPORT_FIELD
    }
  ];
}

function flattenArray(
  arrayOfArrays: ReadonlyArray<ReadonlyArray<Selection>>
): Selection[] {
  const result: Selection[] = [];

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

function generateInputVariablesType(schema: Schema, node: Root, state: State) {
  return exportType(
    `${node.name}Variables`,
    exactObjectTypeAnnotation(
      node.argumentDefinitions.map(arg => {
        return objectTypeProperty(
          arg.name,
          transformInputType(schema, arg.type, state),
          { readonly: false, optional: !schema.isNonNull(arg.type) }
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
    const refTypes = ts.createUnionTypeNode(
      refs.map(ref => ts.createLiteralTypeNode(ts.createStringLiteral(ref)))
    );

    result.push({
      key: FRAGMENT_REFS,
      conditional: false,
      value: ts.createTypeReferenceNode(FRAGMENT_REFS_TYPE_NAME, [refTypes])
    });
  }

  return result;
}

function getFragmentRefsTypeImport(state: State): ts.Statement[] {
  if (state.usedFragments.size > 0) {
    return [
      ts.createImportDeclaration(
        undefined,
        undefined,
        ts.createImportClause(
          undefined,
          ts.createNamedImports([
            ts.createImportSpecifier(
              undefined,
              ts.createIdentifier("FragmentRefs")
            )
          ])
        ),
        ts.createStringLiteral("relay-runtime")
      )
    ];
  }

  return [];
}

function getEnumDefinitions(
  schema: Schema,
  { enumsHasteModule, usedEnums, noFutureProofEnums }: State
) {
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
    const values = schema.getEnumValues(usedEnums[name]);
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
  return `${name}$key`;
}

function getDataTypeName(name: string): string {
  return `${name}$data`;
}

// Should match FLOW_TRANSFORMS array
// https://github.com/facebook/relay/blob/v6.0.0/packages/relay-compiler/language/javascript/RelayFlowGenerator.js#L621-L627
export const transforms: TypeGenerator["transforms"] = [
  RelayDirectiveTransform.transform,
  MaskTransform.transform,
  ConnectionFieldTransform.transform,
  MatchTransform.transform,
  FlattenTransform.transformWithOptions({}),
  RefetchableFragmentTransform.transform
];
