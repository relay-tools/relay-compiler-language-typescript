import * as ts from "typescript";
import * as util from "util";

import { compileRelayQLTag } from "./compileRelayQLTag";
import { getFragmentNameParts } from "./getFragmentNameParts";
import {
  DefinitionNode,
  FragmentDefinitionNode,
  DirectiveNode,
  ArgumentNode,
  FragmentSpreadNode,
  VariableDefinitionNode,
  OperationDefinitionNode,
  ValueNode,
  BooleanValueNode,
  VariableNode,
  visit,
  print
} from "graphql";
import { NormalizedOptions } from "./Options";
import { ScopeAnalyzer, BindingKind } from "./ScopeAnalyzer";

interface Fragment {
  name: string;
  isMasked: boolean;
  args: ts.Expression | null;
}

interface Fragments {
  [key: string]: Fragment;
}

/**
 * Relay Classic transforms to inline generated content.
 */
export function createClassicNode(
  ctx: ts.TransformationContext,
  scopeAnalyzer: ScopeAnalyzer,
  node: ts.TaggedTemplateExpression,
  graphqlDefinition: DefinitionNode,
  options: NormalizedOptions
): ts.Expression {
  if (graphqlDefinition.kind === 'FragmentDefinition') {
    return createFragmentConcreteNode(ctx, scopeAnalyzer, node, graphqlDefinition, options);
  }

  if (graphqlDefinition.kind === 'OperationDefinition') {
    return createOperationConcreteNode(ctx, scopeAnalyzer, node, graphqlDefinition, options);
  }

  throw new Error(
    'BabelPluginRelay: Expected a fragment, mutation, query, or ' +
    'subscription, got `' +
    graphqlDefinition.kind +
    '`.',
  );
}

function createFragmentConcreteNode(
  ctx: ts.TransformationContext,
  scopeAnalyzer: ScopeAnalyzer,
  node: ts.TaggedTemplateExpression,
  graphqlDefinition: FragmentDefinitionNode,
  options: NormalizedOptions
) {
  const {
    classicAST,
    fragments,
    variables,
    argumentDefinitions,
  } = createClassicAST(ctx, graphqlDefinition);
  const substitutions = createSubstitutionsForFragmentSpreads(
    ctx,
    scopeAnalyzer,
    node,
    fragments,
  );

  const transformedAST = createObject({
    kind: ts.createLiteral('FragmentDefinition'),
    argumentDefinitions: createFragmentArguments(
      argumentDefinitions,
      variables,
    ),
    node: createRelayQLTemplate(ctx, scopeAnalyzer, node, classicAST, options),
  });

  return createConcreteNode(transformedAST, substitutions);
}

function createOperationConcreteNode(
  ctx: ts.TransformationContext,
  scopeAnalyzer: ScopeAnalyzer,
  node: ts.TaggedTemplateExpression,
  definition: OperationDefinitionNode,
  options: NormalizedOptions,
) {
  const definitionName = definition.name;
  if (!definitionName) {
    throw new Error('GraphQL operations must contain names');
  }
  const { classicAST, fragments } = createClassicAST(ctx, definition);
  const substitutions = createSubstitutionsForFragmentSpreads(
    ctx,
    scopeAnalyzer,
    node,
    fragments,
  );
  const nodeAST =
    classicAST.operation === 'query'
      ? createFragmentForOperation(ctx, scopeAnalyzer, node, classicAST, options)
      : createRelayQLTemplate(ctx, scopeAnalyzer, node, classicAST, options);
  const transformedAST = createObject({
    kind: ts.createLiteral('OperationDefinition'),
    argumentDefinitions: createOperationArguments(
      definition.variableDefinitions,
    ),
    name: ts.createLiteral(definitionName.value),
    operation: ts.createLiteral(classicAST.operation),
    node: nodeAST,
  });

  return createConcreteNode(transformedAST, substitutions);
}

function createClassicAST(ctx: ts.TransformationContext, definition: DefinitionNode) {
  let fragmentID = 0;

  const fragments: Fragments = {};
  const variables: { [key: string]: null } = {};
  let argumentDefinitions: ReadonlyArray<ArgumentNode> | null = null;

  const visitors = {
    Directive(node: DirectiveNode) {
      switch (node.name.value) {
        case 'argumentDefinitions':
          if (argumentDefinitions) {
            throw new Error(
              'BabelPluginRelay: Expected only one ' +
              '@argumentDefinitions directive',
            );
          }
          argumentDefinitions = node.arguments || null;
          return null;
        case 'connection':
          return null;
        default:
          return node;
      }
    },

    FragmentSpread(node: FragmentSpreadNode) {
      const directives = node.directives || [];

      const fragmentName = node.name.value;
      let fragmentArgumentsAST: ts.ObjectLiteralExpression | null = null;
      let substitutionName = null;
      let isMasked = true;

      if (directives.length === 0) {
        substitutionName = fragmentName;
      } else {
        // TODO: maybe add support when unmasked fragment has arguments.
        // $FlowFixMe graphql 0.12.2
        const directive = directives[0];
        if (directives.length !== 1) {
          throw new Error(
            "BabelPluginRelay: Cannot use both `@arguments` and `@relay(mask: false)` on the " +
            "same fragment spread when in compat mode.",
          );
        }
        switch (directive.name.value) {
          case 'arguments':
            const fragmentArgumentsObject: { [key: string]: ts.Expression } = {};
            // $FlowFixMe graphql 0.12.2
            directive.arguments && directive.arguments.forEach(argNode => {
              const argValue = argNode.value;
              if (argValue.kind === 'Variable') {
                variables[argValue.name.value] = null;
              }
              const arg = convertArgument(argNode);
              fragmentArgumentsObject[arg.name] = arg.ast;
            });
            fragmentArgumentsAST = createObject(fragmentArgumentsObject);
            fragmentID++;
            substitutionName = fragmentName + '_args' + fragmentID;
            break;
          case 'relay':
            const relayArguments = directive.arguments;
            if (!relayArguments || relayArguments.length !== 1 || relayArguments[0].name.value !== 'mask') {
              throw new Error(util.format(
                "TSTransformRelay: Expected `@relay` directive to only have `mask` argument in " +
                "compat mode, but get %s",
                ((relayArguments || [{ name: { value: null } }])[0].name || { value: null }).value,
              ))
            }
            substitutionName = fragmentName;
            isMasked = (relayArguments[0].value as BooleanValueNode).value !== false;
            break;
          default:
            throw new Error(
              'BabelPluginRelay: Unsupported directive `' +
              directive.name.value +
              '` on fragment spread `...' +
              fragmentName +
              '`.',
            );
        }
      }

      if (!substitutionName) {
        throw new Error("TSTransformRelay: Expected `substitutionName` to be non-nul");
      }
      fragments[substitutionName] = {
        name: fragmentName,
        args: fragmentArgumentsAST,
        isMasked,
      };
      return Object.assign({}, node, {
        name: { kind: 'Name', value: substitutionName },
        directives: [],
      });
    },

    Variable(node: VariableNode) {
      variables[node.name.value] = null;
      return node;
    },
  };
  const classicAST = visit(definition, visitors);

  return {
    classicAST,
    fragments,
    variables,
    argumentDefinitions: argumentDefinitions as ArgumentNode[] | null,
  };
}

const RELAY_QL_GENERATED = 'RelayQL_GENERATED';

function createConcreteNode(transformedAST: ts.Expression, substitutions: ts.VariableDeclaration[]) {
  const body: ts.Statement[] = [ts.createReturn(transformedAST)];
  if (substitutions.length > 0) {
    body.unshift(
      ts.createVariableStatement(
        undefined,
        ts.createVariableDeclarationList(substitutions, ts.NodeFlags.Const))
    );
  }
  return ts.createFunctionExpression(
    undefined,
    undefined,
    undefined,
    undefined,
    [ts.createParameter(undefined, undefined, undefined, ts.createIdentifier(RELAY_QL_GENERATED), undefined, undefined, undefined)],
    undefined,
    ts.createBlock(body, /* multiLine */ true),
  );
}

function createOperationArguments(variableDefinitions: ReadonlyArray<VariableDefinitionNode> | undefined) {
  if (!variableDefinitions) {
    return ts.createArrayLiteral([], false);
  }
  return ts.createArrayLiteral(
    variableDefinitions.map(definition => {
      const name = definition.variable.name.value;
      const defaultValue = definition.defaultValue
        ? parseValue(definition.defaultValue)
        : ts.createNull();
      return createLocalArgument(name, defaultValue);
    }, true),
  );
}

function createFragmentArguments(argumentDefinitions: ArgumentNode[] | null, variables: { [key: string]: null }) {
  const concreteDefinitions: ts.Expression[] = [];
  Object.keys(variables).forEach(name => {
    const definition = (argumentDefinitions || []).find(
      arg => arg.name.value === name,
    );
    if (definition) {
      const defaultValueField = (definition.value as any).fields.find(
        (field: any) => field.name.value === 'defaultValue',
      );
      const defaultValue = defaultValueField
        ? parseValue(defaultValueField.value)
        : ts.createNull();
      concreteDefinitions.push(createLocalArgument(name, defaultValue));
    } else {
      concreteDefinitions.push(createRootArgument(name));
    }
  });
  return ts.createArrayLiteral(concreteDefinitions, true);
}

function createLocalArgument(variableName: string, defaultValue: ts.Expression) {
  return createObject({
    defaultValue: defaultValue,
    kind: ts.createLiteral('LocalArgument'),
    name: ts.createLiteral(variableName),
  });
}

function createRootArgument(variableName: string) {
  return ts.createObjectLiteral([
    ts.createPropertyAssignment(ts.createIdentifier('kind'), ts.createLiteral('RootArgument')),
    ts.createPropertyAssignment(ts.createIdentifier('name'), ts.createLiteral(variableName)),
  ], true);
}

function parseValue(value: any) {
  switch (value.kind) {
    case 'BooleanValue':
      return ts.createLiteral(value.value);
    case 'IntValue':
      return ts.createLiteral(parseInt(value.value, 10));
    case 'FloatValue':
      return ts.createLiteral(parseFloat(value.value));
    case 'StringValue':
      return ts.createLiteral(value.value);
    case 'EnumValue':
      return ts.createLiteral(value.value);
    case 'ListValue':
      return ts.createArrayLiteral(value.values.map((item: any) => parseValue(item)), /* multiLine */ true);
    default:
      throw new Error(
        'TSTransformRelay: Unsupported literal type `' + value.kind + '`.',
      );
  }
}

function convertArgument(argNode: ArgumentNode): { name: string; ast: ts.Expression } {
  const name = argNode.name.value;
  const value = argNode.value;
  let ast = null;
  switch (value.kind) {
    case 'Variable':
      const paramName = value.name.value;
      ast = createObject({
        kind: ts.createLiteral('CallVariable'),
        callVariableName: ts.createLiteral(paramName),
      });
      break;
    default:
      ast = parseValue(value);
  }
  return { name, ast };
}

function createObject(obj: { [key: string]: ts.Expression | null }) {
  return ts.createObjectLiteral(
    Object.keys(obj).map(key => {
      const value = obj[key];
      return ts.createPropertyAssignment(ts.createIdentifier(key), value == null ? ts.createNull() : value);
    }),
    /* multiLine */ true,
  );
}

function createFragmentForOperation(
  ctx: ts.TransformationContext,
  scopeAnalyzer: ScopeAnalyzer,
  node: ts.TaggedTemplateExpression,
  operation: OperationDefinitionNode,
  options: NormalizedOptions,
) {
  let type;
  const transformer = options.relayQLTransformer;
  if (transformer == null) {
    throw new Error('relayQLTransformer is null');
  }
  switch (operation.operation) {
    case 'query':
      const queryType = transformer.schema.getQueryType();
      if (!queryType) {
        throw new Error('Schema does not contain a root query type.');
      }
      type = queryType.name;
      break;
    case 'mutation':
      const mutationType = transformer.schema.getMutationType();
      if (!mutationType) {
        throw new Error('Schema does not contain a root mutation type.');
      }
      type = mutationType.name;
      break;
    case 'subscription':
      const subscriptionType = transformer.schema.getSubscriptionType();
      if (!subscriptionType) {
        throw new Error('Schema does not contain a root subscription type.');
      }
      type = subscriptionType.name;
      break;
    default:
      throw new Error(
        'BabelPluginRelay: Unexpected operation type: `' +
        operation.operation +
        '`.',
      );
  }
  const fragmentNode = {
    kind: 'FragmentDefinition',
    loc: operation.loc,
    name: {
      kind: 'Name',
      value: operation.name!.value,
    },
    typeCondition: {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: type,
      },
    },
    directives: operation.directives,
    selectionSet: operation.selectionSet,
  };
  return createRelayQLTemplate(ctx, scopeAnalyzer, node, fragmentNode, options);
}

function createRelayQLTemplate(
  ctx: ts.TransformationContext,
  scopeAnalyzer: ScopeAnalyzer,
  node: ts.TaggedTemplateExpression,
  ast: any,
  options: NormalizedOptions
) {
  const [documentName, propName] = getFragmentNameParts(ast.name.value);
  const text = print(ast);
  const taggedTemplateLiteral = ts.createTaggedTemplate(
    ts.createPropertyAccess(ts.createIdentifier('Relay'), ts.createIdentifier('QL')),
    ts.createNoSubstitutionTemplateLiteral(text),
  );

  // Disable classic validation rules inside of `graphql` tags which are
  // validated by the RelayCompiler with less strict rules.
  const enableValidation = false;

  if (options.relayQLTransformer == null) {
    throw new Error('relayQLTransformer is null');
  }
  return compileRelayQLTag(
    ctx,
    options,
    options.relayQLTransformer,
    taggedTemplateLiteral,
    documentName,
    propName,
    RELAY_QL_GENERATED,
    enableValidation,
  );
}


function createSubstitutionsForFragmentSpreads(
  ctx: ts.TransformationContext,
  scopeAnalyzer: ScopeAnalyzer,
  node: ts.TaggedTemplateExpression,
  fragments: Fragments,
): ts.VariableDeclaration[] {
  return Object.keys(fragments).map(varName => {
    const fragment = fragments[varName];
    const [module, propName] = getFragmentNameParts(fragment.name);
    if (!fragment.isMasked) {
      if (!scopeAnalyzer.getBindingAtNode(node, module) && !scopeAnalyzer.getBindingAtNode(node, propName)) {
        throw new Error(`TSTransformRelay: Please make sure module '${module}' is imported and not renamed or the
        fragment '${
          fragment.name
          }' is defined and bound to local variable '${propName}'. `);
      }
      const fragmentProp = scopeAnalyzer.getBindingAtNode(node, propName)
        ? ts.createPropertyAccess(ts.createIdentifier(propName), ts.createIdentifier(propName))
        : ts.createLogicalOr(
          ts.createPropertyAccess(
            ts.createPropertyAccess(ts.createIdentifier(module), ts.createIdentifier(propName)),
            ts.createIdentifier(propName),
          ),
          ts.createPropertyAccess(ts.createIdentifier(module), ts.createIdentifier(propName)),
        );

      return ts.createVariableDeclaration(
        ts.createIdentifier(varName),
        undefined,
        ts.createPropertyAccess(
          ts.createCall(
            ts.createPropertyAccess(
              ts.createIdentifier(RELAY_QL_GENERATED),
              ts.createIdentifier('__getClassicFragment'),
            ),
            undefined,
            [fragmentProp, ts.createLiteral(true)],
          ),
          // Hack to extract 'ConcreteFragment' from 'ConcreteFragmentDefinition'
          ts.createIdentifier('node'),
        ),
      );
    } else {
      return ts.createVariableDeclaration(
        ts.createIdentifier(varName),
        undefined,
        createGetFragmentCall(ctx, scopeAnalyzer, module, propName, node, fragment.args),
      );
    }
  });
}

function createGetFragmentCall(
  ctx: ts.TransformationContext,
  scopeAnalyzer: ScopeAnalyzer,
  module: string,
  propName: string,
  node: ts.Node,
  fragmentArguments: ts.Expression | null,
): ts.Expression {
  const args = [];
  if (propName) {
    args.push(ts.createLiteral(propName));
  }

  if (fragmentArguments) {
    args.push(fragmentArguments);
  }

  // If "module" is defined locally, then it's unsafe to assume it's a
  // container. It might be a bound reference to the React class itself.
  // To be safe, when defined locally, always check the __container__ property
  // first.
  const container = isDefinedLocally(scopeAnalyzer, node, module)
    ? ts.createLogicalOr(
      // __container__ is defined via ReactRelayCompatContainerBuilder.
      ts.createPropertyAccess(ts.createIdentifier(module), ts.createIdentifier('__container__')),
      ts.createIdentifier(module),
    )
    : ts.createIdentifier(module);

  return ts.createCall(
    ts.createPropertyAccess(container, ts.createIdentifier('getFragment')),
    undefined,
    args,
  );
}

function isDefinedLocally(scopeAnalyzer: ScopeAnalyzer, node: ts.Node, name: string): boolean {
  const binding = scopeAnalyzer.getBindingAtNode(node, name);
  if (binding === null) {
    return false;
  }

  return binding !== BindingKind.Import && binding !== BindingKind.Require;
}
