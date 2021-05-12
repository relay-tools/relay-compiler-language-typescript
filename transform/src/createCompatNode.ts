import * as ts from "typescript";
/**
 * Relay Compat transforms graphql definitions into objects with `modern` and
 * `classic` keys, each containing the resulting transforms.
 */
export function createCompatNode(
  modernNode: ts.Expression,
  classicNode: ts.Expression
): ts.Expression {
  return ts.createObjectLiteral([
    ts.createPropertyAssignment(ts.createIdentifier('modern'), modernNode),
    ts.createPropertyAssignment(ts.createIdentifier('classic'), classicNode),
  ], true);
}

