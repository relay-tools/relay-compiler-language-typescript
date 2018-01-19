import * as ts from "typescript";
import * as path from "path";
import * as util from "util";

import { GraphQLTag, GraphQLTagFinder } from "relay-compiler";
import { callbackify } from "util";
import { isPropertyAccessOrQualifiedName } from "typescript";

interface Location {
  line: number;
  column: number;
}

function isCreateContainerFunction(
  fnName: string
): fnName is
  | "createFragmentContainer"
  | "createRefetchContainer"
  | "createPaginationContainer" {
  return (
    fnName === "createFragmentContainer" ||
    fnName === "createRefetchContainer" ||
    fnName === "createPaginationContainer"
  );
}

function isCreateContainerCall(callExpr: ts.CallExpression): boolean {
  const callee = callExpr.expression;
  return (
    (ts.isIdentifier(callee) && isCreateContainerFunction(callee.text)) ||
    (ts.isPropertyAccessExpression(callee) &&
      ts.isIdentifier(callee.expression) &&
      callee.expression.text === "Relay" &&
      isCreateContainerFunction(callee.name.text))
  );
}

function createContainerName(
  callExpr: ts.CallExpression
):
  | "createFragmentContainer"
  | "createRefetchContainer"
  | "createPaginationContainer" {
  if (
    ts.isIdentifier(callExpr.expression) &&
    isCreateContainerFunction(callExpr.expression.text)
  ) {
    return callExpr.expression.text;
  }
  if (
    ts.isPropertyAccessExpression(callExpr.expression) &&
    ts.isIdentifier(callExpr.expression.expression) &&
    callExpr.expression.expression.text === "Relay"
  ) {
    if (isCreateContainerFunction(callExpr.expression.name.text)) {
      return callExpr.expression.name.text;
    }
  }
  throw new Error("Not a relay create container call");
}

function visit(node: ts.Node, addGraphQLTag: (tag: GraphQLTag) => void): void {
  function visitNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression: {
        const callExpr = node as ts.CallExpression;
        if (isCreateContainerCall(callExpr)) {
          const fragmentSpec = callExpr.arguments[1];
          if (fragmentSpec == null) {
            break;
          }
          if (ts.isObjectLiteralExpression(fragmentSpec)) {
            fragmentSpec.properties.forEach(prop => {
              invariant(
                ts.isPropertyAssignment(prop) &&
                  prop.questionToken == null &&
                  ts.isIdentifier(prop.name) &&
                  ts.isTaggedTemplateExpression(prop.initializer),
                "FindGraphQLTags: `%s` expects fragment definitions to be " +
                  "`key: graphql`.",
                createContainerName(callExpr)
              );

              // We tested for this
              const propAssignment = prop as ts.PropertyAssignment;

              const taggedTemplate = propAssignment.initializer as ts.TaggedTemplateExpression;
              invariant(
                isGraphQLTag(taggedTemplate.tag),
                "FindGraphQLTags: `%s` expects fragment definitions to be tagged " +
                  "with `graphql`, got `%s`.",
                createContainerName(callExpr),
                taggedTemplate.tag.getText()
              );
              addGraphQLTag({
                keyName: (propAssignment.name as ts.Identifier).text,
                template: getGraphQLText(taggedTemplate),
                sourceLocationOffset: getSourceLocationOffset(taggedTemplate)
              });
            });
          } else {
            invariant(
              ts.isTaggedTemplateExpression(fragmentSpec),
              "FindGraphQLTags: `%s` expects a second argument of fragment " +
                "definitions.",
              createContainerName(callExpr)
            );
            const taggedTemplate = fragmentSpec as ts.TaggedTemplateExpression;
            invariant(
              isGraphQLTag(taggedTemplate.tag),
              "FindGraphQLTags: `%s` expects fragment definitions to be tagged " +
                "with `graphql`, got `%s`.",
              createContainerName(callExpr),
              taggedTemplate.tag.getText()
            );
            addGraphQLTag({
              keyName: null,
              template: getGraphQLText(taggedTemplate),
              sourceLocationOffset: getSourceLocationOffset(taggedTemplate)
            });
          }
          // Visit remaining arguments
          for (let i = 2; i < callExpr.arguments.length; i++) {
            visit(callExpr.arguments[i], addGraphQLTag);
          }
          return;
        }
        break;
      }
      case ts.SyntaxKind.TaggedTemplateExpression: {
        const taggedTemplate = node as ts.TaggedTemplateExpression;
        if (isGraphQLTag(taggedTemplate.tag)) {
          // TODO: This code previously had no validation and thus no keyName/sourceLocationOffset. Are these right?
          addGraphQLTag({
            keyName: null,
            template: getGraphQLText(taggedTemplate),
            sourceLocationOffset: getSourceLocationOffset(taggedTemplate)
          });
        }
      }
    }
    ts.forEachChild(node, visitNode);
  }

  visitNode(node);
}

function isGraphQLTag(tag: ts.Node): boolean {
  return (
    tag.kind === ts.SyntaxKind.Identifier &&
    (tag as ts.Identifier).text === "graphql"
  );
}

function getTemplateNode(
  quasi: ts.TaggedTemplateExpression
): ts.NoSubstitutionTemplateLiteral {
  invariant(
    quasi.template.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral,
    "FindGraphQLTags: Substitutions are not allowed in graphql tags."
  );
  return quasi.template as ts.NoSubstitutionTemplateLiteral;
}

function getGraphQLText(quasi: ts.TaggedTemplateExpression) {
  return getTemplateNode(quasi).text;
}

function getSourceLocationOffset(quasi: ts.TaggedTemplateExpression) {
  const pos = getTemplateNode(quasi).pos;
  const loc = quasi.getSourceFile().getLineAndCharacterOfPosition(pos);
  return {
    line: loc.line,
    column: loc.character + 1
  };
}

function invariant(condition: boolean, msg: string, ...args: any[]) {
  if (!condition) {
    throw new Error(util.format(msg, ...args));
  }
}

export const find: GraphQLTagFinder = (text, filePath) => {
  const result: GraphQLTag[] = [];
  const ast = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
  visit(ast, tag => result.push(tag));
  return result;
};
