import * as ts from "typescript";

import { RelayTransformError } from "./RelayTransformError";

import { find } from "./find";
import * as util from "util";

import {
  RelayQLField,
  RelayQLFragment,
  RelayQLFragmentSpread,
  RelayQLInlineFragment,
  RelayQLMutation,
  RelayQLQuery,
  RelayQLSubscription,
} from "./RelayQLAST";
import { ID } from "./RelayQLNodeInterface";

import {
  RelayQLArgument,
  RelayQLArgumentType,
  RelayQLDefinition,
  RelayQLDirective,
  RelayQLType,
} from "./RelayQLAST";

export type Printable = ts.Expression;
export type Substitution = {
  name: string,
  value: Printable,
};

type PrinterOptions = {
  inputArgumentName: string | null,
  snakeCase: boolean,
};

export function RelayQLPrinter(options: PrinterOptions) {
  const formatFields = options.snakeCase
    ? function <T extends { [key: string]: string }>(fields: T): T {
      const formatted = {} as T;
      (Object.keys(fields) as (keyof T)[]).forEach(name => {
        formatted[name] = (name as string).replace(
          /[A-Z]/g,
          letter => '_' + letter.toLowerCase(),
        );
      });
      return formatted;
    }
    : function <T>(fields: T): T {
      return fields;
    };

  const EMPTY_ARRAY = ts.createArrayLiteral([], /* multiLine */ false);
  const FIELDS = formatFields({
    __typename: '__typename',
    clientMutationId: 'clientMutationId',
    clientSubscriptionId: 'clientSubscriptionId',
    cursor: 'cursor',
    edges: 'edges',
    hasNextPage: 'hasNextPage',
    hasPreviousPage: 'hasPreviousPage',
    node: 'node',
    pageInfo: 'pageInfo',
  });
  const INPUT_ARGUMENT_NAME = options.inputArgumentName || 'input';
  const NULL = ts.createNull();

  class RelayQLPrinter {
    tagName: string;
    variableNames: { [variableName: string]: void };

    constructor(
      tagName: string,
      variableNames: { [variableName: string]: void },
    ) {
      this.tagName = tagName;
      this.variableNames = variableNames;
    }

    print(
      definition: RelayQLDefinition<any>,
      substitutions: Array<Substitution>,
      enableValidation: boolean = true,
    ): Printable {
      let printedDocument: ts.Expression;
      if (definition instanceof RelayQLQuery) {
        printedDocument = this.printQuery(definition, enableValidation);
      } else if (definition instanceof RelayQLFragment) {
        printedDocument = this.printFragment(definition);
      } else if (definition instanceof RelayQLMutation) {
        printedDocument = this.printMutation(definition, enableValidation);
      } else if (definition instanceof RelayQLSubscription) {
        printedDocument = this.printSubscription(definition, enableValidation);
      } else {
        throw new RelayTransformError(
          util.format('Unsupported definition: %s', definition),
          definition.getLocation(),
        );
      }
      return ts.createCall(
        ts.createFunctionExpression(
          undefined,
          undefined,
          undefined,
          undefined,
          substitutions.map(substitution => ts.createParameter(
            undefined,
            undefined,
            undefined,
            ts.createIdentifier(substitution.name), undefined, undefined, undefined),
          ),
          undefined,
          ts.createBlock([
            ts.createReturn(printedDocument),
          ], /* mutliLine */ true),
        ),
        undefined,
        substitutions.map(substitution => substitution.value),
      );
    }

    printQuery(query: RelayQLQuery, enableValidation: boolean): Printable {
      const rootFields = query.getFields();
      if (rootFields.length !== 1 && enableValidation) {
        throw new RelayTransformError(
          util.format(
            'There are %d fields supplied to the query named `%s`, but queries ' +
            'must have exactly one field.',
            rootFields.length,
            query.getName(),
          ),
          query.getLocation(),
        );
      }
      const rootField = rootFields[0];
      const rootFieldType = rootField.getType();
      const rootFieldArgs = rootField.getArguments();

      const requisiteFields: { [key: string]: boolean } = {};
      const identifyingFieldDef = rootFieldType.getIdentifyingFieldDefinition();
      if (identifyingFieldDef) {
        requisiteFields[identifyingFieldDef.getName()] = true;
      }
      if (rootFieldType.isAbstract()) {
        requisiteFields[FIELDS.__typename] = true;
      }
      const selections = this.printSelections(rootField, requisiteFields);
      const metadata = {} as { isPlural?: boolean; isAbstract?: boolean; identifyingArgName?: string; identifyingArgType?: string };
      if (rootFieldType.isList()) {
        metadata.isPlural = true;
      }
      if (rootFieldType.isAbstract()) {
        metadata.isAbstract = true;
      }
      if (rootFieldArgs.length > 1) {
        throw new RelayTransformError(
          util.format(
            'Invalid root field `%s`; Relay only supports root fields with zero ' +
            'or one argument.',
            rootField.getName(),
          ),
          query.getLocation(),
        );
      }

      let calls: Printable = NULL;
      if (rootFieldArgs.length === 1) {
        // Until such time as a root field's 'identifying argument' (one that has
        // a 1-1 correspondence with a Relay record, or null) has a formal type,
        // assume that the lone arg in a root field's call is the identifying one.
        const identifyingArg = rootFieldArgs[0];
        const identifyingArgName = identifyingArg.getName();
        const identifyingArgType = identifyingArg
          .getType()
          .getName({ modifiers: true });
        metadata.identifyingArgName = identifyingArgName;
        metadata.identifyingArgType = identifyingArgType;
        calls = ts.createArrayLiteral(
          [
            codify({
              kind: ts.createLiteral('Call'),
              metadata: objectify({
                type: identifyingArgType,
              }),
              name: ts.createLiteral(identifyingArgName),
              value: this.printArgumentValue(identifyingArg),
            }),
          ],
          /* multiLine */ true,
        );
      }

      return codify({
        calls,
        children: selections,
        directives: this.printDirectives(rootField.getDirectives()),
        fieldName: ts.createLiteral(rootField.getName()),
        kind: ts.createLiteral('Query'),
        metadata: objectify(metadata as {}),
        name: ts.createLiteral(query.getName()),
        type: ts.createLiteral(rootFieldType.getName({ modifiers: false })),
      });
    }

    printFragment(fragment: RelayQLFragment): Printable {
      const fragmentType = fragment.getType();

      const requisiteFields: { [key: string]: boolean } = {};
      let idFragment;
      if (fragmentType.hasField(ID)) {
        requisiteFields[ID] = true;
      } else if (shouldGenerateIdFragment(fragment)) {
        idFragment = fragmentType.generateIdFragment();
      }
      if (fragmentType.isAbstract()) {
        requisiteFields[FIELDS.__typename] = true;
      }
      const selections = this.printSelections(
        fragment,
        requisiteFields,
        idFragment ? [idFragment] : null,
        fragment.hasDirective('generated'),
      );

      const relayDirective = findRelayDirective(fragment);
      const selectVariables =
        relayDirective &&
        find(
          relayDirective.getArguments(),
          arg => arg.getName() === 'variables',
        );

      const metadata = this.printRelayDirectiveMetadata(fragment, {
        isAbstract: fragmentType.isAbstract(),
        isTrackingEnabled: !!selectVariables,
      });

      const fragmentCode = codify({
        children: selections,
        directives: this.printDirectives(fragment.getDirectives()),
        id: this.printFragmentID(fragment),
        kind: ts.createLiteral('Fragment'),
        metadata,
        name: ts.createLiteral(fragment.getName()),
        type: ts.createLiteral(fragmentType.getName({ modifiers: false })),
      });

      if (selectVariables) {
        const selectVariablesValue = selectVariables.getValue();
        if (!Array.isArray(selectVariablesValue)) {
          throw new RelayTransformError(
            'The variables argument to the @relay directive should be an array ' +
            'of strings.',
            fragment.getLocation(),
          );
        }
        return ts.createCall(
          ts.createPropertyAccess(
            identify(this.tagName),
            ts.createIdentifier('__createFragment'),
          ),
          undefined,
          [
            fragmentCode,
            ts.createObjectLiteral(
              selectVariablesValue.map(item => {
                const value = item.getValue();
                return ts.createPropertyAssignment(value, this.printVariable(value));
              }),
              /* multiLine */ true,
            ),
          ],
        );
      }

      return fragmentCode;
    }

    printFragmentID(fragment: RelayQLFragment): Printable {
      return ts.createCall(
        ts.createPropertyAccess(identify(this.tagName), ts.createIdentifier('__id')),
        undefined,
        [],
      );
    }

    printMutation(
      mutation: RelayQLMutation,
      enableValidation: boolean,
    ): Printable {
      const rootFields = mutation.getFields();
      if (rootFields.length !== 1 && enableValidation) {
        throw new RelayTransformError(
          util.format(
            'There are %d fields supplied to the mutation named `%s`, but ' +
            'mutations must have exactly one field.',
            rootFields.length,
            mutation.getName(),
          ),
          mutation.getLocation(),
        );
      }
      const rootField = rootFields[0];
      const rootFieldType = rootField.getType();
      validateMutationField(rootField);
      const requisiteFields: { [key: string]: boolean } = {};
      if (rootFieldType.hasField(FIELDS.clientMutationId)) {
        requisiteFields[FIELDS.clientMutationId] = true;
      }
      const selections = this.printSelections(rootField, requisiteFields);
      const metadata = {
        inputType: this.printArgumentTypeForMetadata(
          rootField.getDeclaredArgument(INPUT_ARGUMENT_NAME),
        ),
      };

      return codify({
        calls: ts.createArrayLiteral([
          codify({
            kind: ts.createLiteral('Call'),
            metadata: objectify({}),
            name: ts.createLiteral(rootField.getName()),
            value: this.printVariable('input'),
          }),
        ], /* multiLine */ true),
        children: selections,
        directives: this.printDirectives(mutation.getDirectives()),
        kind: ts.createLiteral('Mutation'),
        metadata: objectify(metadata),
        name: ts.createLiteral(mutation.getName()),
        responseType: ts.createLiteral(rootFieldType.getName({ modifiers: false })),
      });
    }

    printSubscription(
      subscription: RelayQLSubscription,
      enableValidation: boolean,
    ): Printable {
      const rootFields = subscription.getFields();
      if (rootFields.length !== 1 && enableValidation) {
        throw new RelayTransformError(
          util.format(
            'There are %d fields supplied to the subscription named `%s`, but ' +
            'subscriptions must have exactly one field.',
            rootFields.length,
            subscription.getName(),
          ),
          subscription.getLocation(),
        );
      }
      const rootField = rootFields[0];
      const rootFieldType = rootField.getType();
      validateMutationField(rootField);
      const requisiteFields: { [key: string]: boolean } = {};
      if (rootFieldType.hasField(FIELDS.clientSubscriptionId)) {
        requisiteFields[FIELDS.clientSubscriptionId] = true;
      }
      if (rootFieldType.hasField(FIELDS.clientMutationId)) {
        requisiteFields[FIELDS.clientMutationId] = true;
      }
      const selections = this.printSelections(rootField, requisiteFields);
      const metadata = {
        inputType: this.printArgumentTypeForMetadata(
          rootField.getDeclaredArgument(INPUT_ARGUMENT_NAME),
        ),
      };

      return codify({
        calls: ts.createArrayLiteral([
          codify({
            kind: ts.createLiteral('Call'),
            metadata: objectify({}),
            name: ts.createLiteral(rootField.getName()),
            value: this.printVariable('input'),
          }),
        ], /* multiLine */ true),
        children: selections,
        directives: this.printDirectives(subscription.getDirectives()),
        kind: ts.createLiteral('Subscription'),
        metadata: objectify(metadata),
        name: ts.createLiteral(subscription.getName()),
        responseType: ts.createLiteral(rootFieldType.getName({ modifiers: false })),
      });
    }

    printSelections(
      parent: RelayQLField | RelayQLFragment,
      requisiteFields: { [fieldName: string]: boolean },
      extraFragments?: Array<RelayQLFragment> | null,
      isGeneratedQuery = false,
    ): Printable {
      const fields: RelayQLField[] = [];
      const printedFragments: Printable[] = [];
      let didPrintFragmentReference = false;
      parent.getSelections().forEach(selection => {
        if (selection instanceof RelayQLFragmentSpread) {
          // Assume that all spreads exist via template substitution.
          if (selection.getDirectives().length !== 0) {
            throw new RelayTransformError(
              'Directives are not yet supported for `${fragment}`-style fragment ' +
              'references.',
              selection.getLocation(),
            );
          }
          printedFragments.push(this.printFragmentReference(selection));
          didPrintFragmentReference = true;
        } else if (selection instanceof RelayQLInlineFragment) {
          printedFragments.push(this.printFragment(selection.getFragment()));
        } else if (selection instanceof RelayQLField) {
          fields.push(selection);
        } else {
          throw new RelayTransformError(
            util.format('Unsupported selection type `%s`.', selection),
            (selection as any).getLocation(),
          );
        }
      });
      if (extraFragments) {
        extraFragments.forEach(fragment => {
          printedFragments.push(this.printFragment(fragment));
        });
      }
      const printedFields = this.printFields(
        fields,
        parent,
        requisiteFields,
        isGeneratedQuery,
      );
      const selections = [...printedFields, ...printedFragments];

      if (selections.length) {
        const arrayExpressionOfSelections = ts.createArrayLiteral(selections, /* multiLine */ true);
        return didPrintFragmentReference
          ? shallowFlatten(arrayExpressionOfSelections)
          : arrayExpressionOfSelections;
      }
      return NULL;
    }

    printFields(
      fields: Array<RelayQLField>,
      parent: RelayQLField | RelayQLFragment,
      requisiteFields: { [fieldName: string]: boolean },
      isGeneratedQuery = false,
    ): Array<Printable> {
      const parentType = parent.getType();
      if (
        parentType.isConnection() &&
        parentType.hasField(FIELDS.pageInfo) &&
        fields.some(field => field.getName() === FIELDS.edges)
      ) {
        requisiteFields[FIELDS.pageInfo] = true;
      }

      const generatedFields = { ...requisiteFields };

      const printedFields: Printable[] = [];
      fields.forEach(field => {
        delete generatedFields[field.getName()];
        printedFields.push(
          this.printField(
            field,
            parent,
            requisiteFields,
            generatedFields,
            isGeneratedQuery,
          ),
        );
      });

      Object.keys(generatedFields).forEach(fieldName => {
        const generatedField = parentType.generateField(fieldName);
        printedFields.push(
          this.printField(
            generatedField,
            parent,
            requisiteFields,
            generatedFields,
            isGeneratedQuery,
          ),
        );
      });
      return printedFields;
    }

    printField(
      field: RelayQLField,
      parent: RelayQLField | RelayQLFragment,
      requisiteSiblings: { [fieldName: string]: boolean },
      generatedSiblings: { [fieldName: string]: boolean },
      isGeneratedQuery = false,
    ): Printable {
      const fieldType = field.getType();

      const metadata: {
        canHaveSubselections?: boolean,
        inferredPrimaryKey?: string | null,
        inferredRootCallName?: string | null,
        isAbstract?: boolean,
        isConnection?: boolean,
        isFindable?: boolean,
        isGenerated?: boolean,
        isPlural?: boolean,
        isRequisite?: boolean,
      } = {};
      const requisiteFields: { [key: string]: boolean } = {};
      let idFragment;
      if (fieldType.hasField(ID)) {
        requisiteFields[ID] = true;
      } else if (shouldGenerateIdFragment(field)) {
        idFragment = fieldType.generateIdFragment();
      }

      if (!isGeneratedQuery) {
        validateField(field, parent.getType());
      }

      if (fieldType.canHaveSubselections()) {
        metadata.canHaveSubselections = true;
      }
      // TODO: Generalize to non-`Node` types.
      if (fieldType.alwaysImplements('Node')) {
        metadata.inferredRootCallName = 'node';
        metadata.inferredPrimaryKey = ID;
      }
      if (fieldType.isConnection()) {
        if (
          field.hasDeclaredArgument('first') ||
          field.hasDeclaredArgument('last')
        ) {
          if (!isGeneratedQuery) {
            validateConnectionField(field);
          }
          metadata.isConnection = true;
          if (field.hasDeclaredArgument('find')) {
            metadata.isFindable = true;
          }
        }
      } else if (fieldType.isConnectionPageInfo()) {
        requisiteFields[FIELDS.hasNextPage] = true;
        requisiteFields[FIELDS.hasPreviousPage] = true;
      } else if (fieldType.isConnectionEdge()) {
        requisiteFields[FIELDS.cursor] = true;
        requisiteFields[FIELDS.node] = true;
      }
      if (fieldType.isAbstract()) {
        metadata.isAbstract = true;
        requisiteFields[FIELDS.__typename] = true;
      }
      if (fieldType.isList()) {
        metadata.isPlural = true;
      }
      if (generatedSiblings.hasOwnProperty(field.getName())) {
        metadata.isGenerated = true;
      }
      if (requisiteSiblings.hasOwnProperty(field.getName())) {
        metadata.isRequisite = true;
      }

      const selections = this.printSelections(
        field,
        requisiteFields,
        idFragment ? [idFragment] : null,
        isGeneratedQuery,
      );
      const fieldAlias = field.getAlias();
      const args = field.getArguments();
      const calls = args.length
        ? ts.createArrayLiteral(args.map(arg => this.printArgument(arg)), /* multiLine */ true)
        : NULL;

      return codify({
        alias: fieldAlias ? ts.createLiteral(fieldAlias) : NULL,
        calls,
        children: selections,
        directives: this.printDirectives(field.getDirectives()),
        fieldName: ts.createLiteral(field.getName()),
        kind: ts.createLiteral('Field'),
        metadata: this.printRelayDirectiveMetadata(field, metadata),
        type: ts.createLiteral(fieldType.getName({ modifiers: false })),
      });
    }

    printFragmentReference(
      fragmentReference: RelayQLFragmentSpread,
    ): Printable {
      return ts.createCall(
        ts.createPropertyAccess(identify(this.tagName), ts.createIdentifier('__frag')),
        undefined,
        [ts.createIdentifier(fragmentReference.getName())],
      );
    }

    printArgument(arg: RelayQLArgument): Printable {
      const metadata: { [key: string]: string } = {};
      const inputType = this.printArgumentTypeForMetadata(arg.getType());
      if (inputType) {
        metadata.type = inputType;
      }
      return codify({
        kind: ts.createLiteral('Call'),
        metadata: objectify(metadata),
        name: ts.createLiteral(arg.getName()),
        value: this.printArgumentValue(arg),
      });
    }

    printArgumentValue(arg: RelayQLArgument): Printable {
      if (arg.isVariable()) {
        return this.printVariable(arg.getVariableName());
      } else {
        return this.printValue(arg.getValue());
      }
    }

    printVariable(name: string): Printable {
      // Assume that variables named like substitutions are substitutions.
      if (this.variableNames.hasOwnProperty(name)) {
        return ts.createCall(
          ts.createPropertyAccess(identify(this.tagName), ts.createIdentifier('__var')),
          undefined,
          [ts.createIdentifier(name)],
        );
      }
      return codify({
        kind: ts.createLiteral('CallVariable'),
        callVariableName: ts.createLiteral(name),
      });
    }

    printValue(value: any): Printable {
      if (Array.isArray(value)) {
        return ts.createArrayLiteral(
          // $FlowFixMe
          value.map(element => this.printArgumentValue(element)),
          /* multiLine */ true
        );
      }
      return codify({
        kind: ts.createLiteral('CallValue'),
        // codify() skips properties where value === NULL, but `callValue` is a
        // required property. Create fresh null literals to force the property
        // to be printed.
        callValue: value == null ? ts.createNull() : printLiteralValue(value),
      });
    }

    printDirectives(directives: Array<RelayQLDirective>): Printable {
      const printedDirectives: Printable[] = [];
      directives.forEach(directive => {
        if (directive.getName() === 'relay') {
          return;
        }
        printedDirectives.push(
          ts.createObjectLiteral([
            ts.createPropertyAssignment('kind', ts.createLiteral('Directive')),
            ts.createPropertyAssignment('name', ts.createLiteral(directive.getName())),
            ts.createPropertyAssignment(
              'args',
              ts.createArrayLiteral(
                directive
                  .getArguments()
                  .map(arg =>
                    ts.createObjectLiteral([
                      ts.createPropertyAssignment('name', ts.createLiteral(arg.getName())),
                      ts.createPropertyAssignment('value', this.printArgumentValue(arg)),
                    ], true),
                ),
                /* multiLine */ true
              ),
            ),
          ], true),
        );
      });
      if (printedDirectives.length) {
        return ts.createArrayLiteral(printedDirectives, /* multiLine */ true);
      }
      return NULL;
    }

    printRelayDirectiveMetadata(
      node: RelayQLField | RelayQLFragment,
      maybeMetadata?: { [key: string]: any },
    ): Printable {
      const properties: ts.PropertyAssignment[] = [];
      const relayDirective = findRelayDirective(node);
      if (relayDirective) {
        relayDirective.getArguments().forEach(arg => {
          if (arg.isVariable()) {
            throw new RelayTransformError(
              util.format(
                'You supplied `$%s` as the `%s` argument to the `@relay` ' +
                'directive, but `@relay` require scalar argument values.',
                arg.getVariableName(),
                arg.getName(),
              ),
              node.getLocation(),
            );
          }
          if (arg.getName() !== 'variables') {
            properties.push(
              ts.createPropertyAssignment(arg.getName(), ts.createLiteral(arg.getValue())),
            );
          }
        });
      }
      if (maybeMetadata) {
        const metadata = maybeMetadata;
        Object.keys(metadata).forEach(key => {
          if (metadata[key]) {
            properties.push(ts.createPropertyAssignment(key, ts.createLiteral(metadata[key])));
          }
        });
      }
      return ts.createObjectLiteral(properties, /* multiLine */ true);
    }

    /**
     * Prints the type for arguments that are transmitted via variables.
     */
    printArgumentTypeForMetadata(argType: RelayQLArgumentType): string | null {
      // Only booleans and strings can be safely inlined, which is indicated to
      // the runtime by the lack of a `metadata.type` property.
      // - numbers may be represented as strings in client code due to
      //   the limitations with JavaScript numeric representations, and a
      //   string can't be inlined where a number is expected.
      // - enums are unquoted, unlike JSON.
      // - input objects have unquoted keys, unlike JSON.
      // - custom scalars could be objects, in which case input object rules
      //   apply.
      if (argType.isBoolean() || argType.isID() || argType.isString()) {
        return null;
      }
      return argType.getName({ modifiers: true });
    }
  }

  /**
   * Determine if a `... on Node { id }` fragment should be generated for a
   * field/fragment to allow identification of the response record. This
   * fragment should be added when some/all implementors of the node's type
   * also implement `Node` but a `Node` fragment is not already present. If it
   * is present then `id` would be added as a requisite field.
   */
  function shouldGenerateIdFragment(
    node: RelayQLField | RelayQLFragment,
  ): boolean {
    return (
      node.getType().mayImplement('Node') &&
      !node.getSelections().some(
        selection =>
          selection instanceof RelayQLInlineFragment &&
          selection
            .getFragment()
            .getType()
            .getName({ modifiers: false }) === 'Node',
      )
    );
  }

  function validateField(field: RelayQLField, parentType: RelayQLType): void {
    if (field.getName() === 'node') {
      var argTypes = field.getDeclaredArguments();
      var argNames = Object.keys(argTypes);
      if (
        !parentType.isQueryType() &&
        argNames.length === 1 &&
        argNames[0] === ID
      ) {
        throw new RelayTransformError(
          util.format(
            'You defined a `node(%s: %s)` field on type `%s`, but Relay requires ' +
            'the `node` field to be defined on the root type. See the Object ' +
            'Identification Guide: \n' +
            'http://facebook.github.io/relay/docs/graphql-object-identification.html',
            ID,
            argNames[0] && argTypes[argNames[0]].getName({ modifiers: true }),
            parentType.getName({ modifiers: false }),
          ),
          field.getLocation(),
        );
      }
    }
  }

  function validateConnectionField(field: RelayQLField): void {
    const [first, last, before, after] = [
      field.findArgument('first'),
      field.findArgument('last'),
      field.findArgument('before'),
      field.findArgument('after'),
    ];
    let condition =
      !first || !last || (first.isVariable() && last.isVariable());
    if (!condition) {
      throw new RelayTransformError(
        util.format(
          'Connection arguments `%s(first: <count>, last: <count>)` are ' +
          'not supported unless both are variables. Use `(first: <count>)`, ' +
          '`(last: <count>)`, or `(first: $<var>, last: $<var>)`.',
          field.getName(),
        ),
        field.getLocation(),
      );
    }
    condition =
      !first || !before || (first.isVariable() && before.isVariable());
    if (!condition) {
      throw new RelayTransformError(
        util.format(
          'Connection arguments `%s(before: <cursor>, first: <count>)` are ' +
          'not supported unless both are variables. Use `(first: <count>)`, ' +
          '`(after: <cursor>, first: <count>)`, `(before: <cursor>, last: <count>)`, ' +
          'or `(before: $<var>, first: $<var>)`.',
          field.getName(),
        ),
        field.getLocation(),
      );
    }
    condition = !last || !after || (last.isVariable() && after.isVariable());
    if (!condition) {
      throw new RelayTransformError(
        util.format(
          'Connection arguments `%s(after: <cursor>, last: <count>)` are ' +
          'not supported unless both are variables. Use `(last: <count>)`, ' +
          '`(before: <cursor>, last: <count>)`, `(after: <cursor>, first: <count>)`, ' +
          'or `(after: $<var>, last: $<var>)`.',
          field.getName(),
        ),
        field.getLocation(),
      );
    }

    // Use `any` because we already check `isConnection` before validating.
    const connectionNodeType = (field as any)
      .getType()
      .getFieldDefinition(FIELDS.edges)
      .getType()
      .getFieldDefinition(FIELDS.node)
      .getType();

    // NOTE: These checks are imperfect because we cannot trace fragment spreads.
    forEachRecursiveField(field, subfield => {
      if (
        subfield.getName() === FIELDS.edges ||
        subfield.getName() === FIELDS.pageInfo
      ) {
        const hasCondition =
          field.isPattern() ||
          field.hasArgument('find') ||
          field.hasArgument('first') ||
          field.hasArgument('last');

        if (!hasCondition) {
          throw new RelayTransformError(
            util.format(
              'You supplied the `%s` field on a connection named `%s`, but you did ' +
              'not supply an argument necessary for Relay to handle the connection. ' +
              'Please specify a limit argument like `first`, or `last` or ' +
              'fetch a specific item with a `find` argument.',
              subfield.getName(),
              field.getName(),
            ),
            field.getLocation(),
          );
        }
      } else {
        // Suggest `edges{node{...}}` instead of `nodes{...}`.
        const subfieldType = subfield.getType();
        const isNodesLikeField =
          subfieldType.isList() &&
          subfieldType.getName({ modifiers: false }) ===
          connectionNodeType.getName({ modifiers: false });

        if (isNodesLikeField) {
          throw new RelayTransformError(
            util.format(
              'You supplied a field named `%s` on a connection named `%s`, but ' +
              'pagination is not supported on connections without using `%s`. ' +
              'Use `%s{%s{%s{...}}}` instead.',
              subfield.getName(),
              field.getName(),
              FIELDS.edges,
              field.getName(),
              FIELDS.edges,
              FIELDS.node,
            ),
            field.getLocation(),
          );
        }
      }
    });
  }

  function validateMutationField(rootField: RelayQLField): void {
    const declaredArgs = rootField.getDeclaredArguments();
    const declaredArgNames = Object.keys(declaredArgs);
    if (declaredArgNames.length !== 1) {
      throw new RelayTransformError(
        util.format(
          'Your schema defines a mutation field `%s` that takes %d arguments, ' +
          'but mutation fields must have exactly one argument named `%s`.',
          rootField.getName(),
          declaredArgNames.length,
          INPUT_ARGUMENT_NAME,
        ),
        rootField.getLocation(),
      );
    }

    if (declaredArgNames[0] !== INPUT_ARGUMENT_NAME) {
      throw new RelayTransformError(
        util.format(
          'Your schema defines a mutation field `%s` that takes an argument ' +
          'named `%s`, but mutation fields must have exactly one argument ' +
          'named `%s`.',
          rootField.getName(),
          declaredArgNames[0],
          INPUT_ARGUMENT_NAME,
        ),
        rootField.getLocation(),
      );
    }

    const rootFieldArgs = rootField.getArguments();
    if (rootFieldArgs.length > 1) {
      throw new RelayTransformError(
        util.format(
          'There are %d arguments supplied to the mutation field named `%s`, ' +
          'but mutation fields must have exactly one `%s` argument.',
          rootFieldArgs.length,
          rootField.getName(),
          INPUT_ARGUMENT_NAME,
        ),
        rootField.getLocation(),
      );
    }
  }

  const forEachRecursiveField = function(
    parentSelection: RelayQLField | RelayQLFragment,
    callback: (field: RelayQLField) => void,
  ): void {
    parentSelection.getSelections().forEach(selection => {
      if (selection instanceof RelayQLField) {
        callback(selection);
      } else if (selection instanceof RelayQLInlineFragment) {
        forEachRecursiveField(selection.getFragment(), callback);
      }
      // Ignore `RelayQLFragmentSpread` selections.
    });
  };

  function codify(obj: { [key: string]: Printable }): Printable {
    const properties: ts.PropertyAssignment[] = [];
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== NULL) {
        properties.push(ts.createPropertyAssignment(ts.createIdentifier(key), value));
      }
    });
    return ts.createObjectLiteral(properties, /* multiLine */ true);
  }

  function identify(str: string): Printable {
    return str.split('.').reduce((acc, name) => {
      if (!acc) {
        return ts.createIdentifier(name);
      }
      return ts.createPropertyAccess(acc, ts.createIdentifier(name));
    }, null as null | Printable) as Printable;
  }

  function objectify(obj: { [key: string]: string | null | number | boolean }): Printable {
    const properties: ts.PropertyAssignment[] = [];
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value) {
        properties.push(ts.createPropertyAssignment(ts.createIdentifier(key), ts.createLiteral(value)));
      }
    });
    return ts.createObjectLiteral(properties, /* multiLine */ true);
  }

  function printLiteralValue(value: any): Printable {
    if (value == null) {
      return NULL;
    } else if (Array.isArray(value)) {
      return ts.createArrayLiteral(value.map(printLiteralValue), /* multiLine */ true);
    } else if (typeof value === 'object' && value != null) {
      const objectValue = value;
      return ts.createObjectLiteral(
        Object.keys(objectValue).map(key =>
          ts.createPropertyAssignment(key, printLiteralValue(objectValue[key])),
        ),
        /* multiLine */ true,
      );
    } else {
      return ts.createLiteral(value);
    }
  }

  function shallowFlatten(arr: Printable): Printable {
    return ts.createCall(
      ts.createPropertyAccess(
        ts.createPropertyAccess(EMPTY_ARRAY, ts.createIdentifier('concat')),
        ts.createIdentifier('apply'),
      ),
      undefined,
      [EMPTY_ARRAY, arr],
    );
  }

  function findRelayDirective(
    node: RelayQLField | RelayQLFragment,
  ): RelayQLDirective | undefined {
    return find(
      node.getDirectives(),
      directive => directive.getName() === 'relay',
    );
  }

  return RelayQLPrinter;
};
