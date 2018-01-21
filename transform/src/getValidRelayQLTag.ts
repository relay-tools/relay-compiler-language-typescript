import * as ts from "typescript";

/**
 * Given a TemplateLiteral path, return the metadata about a RelayQL tag
 * if one exists.
 */
export function getValidRelayQLTag(
  expr: ts.TaggedTemplateExpression,
): [ts.TaggedTemplateExpression, string, string | null] | null {
  const tag = expr.tag;

  const tagText = tag.getText()

  const tagName = tagText === 'Relay.QL'
    ? 'Relay.QL'
    : tagText === 'RelayClassic_DEPRECATED.QL'
      ? 'RelayClassic_DEPRECATED.QL'
      : tagText === 'RelayClassic.QL'
        ? 'RelayClassic.QL'
        : tagText === 'RelayQL' ? 'RelayQL' : null;
  if (!tagName) {
    return null;
  }

  const parent = expr.parent;
  if (parent == null) {
    return [expr, tagName, null];
  }
  if (!ts.isArrowFunction(parent) && !ts.isFunctionExpression(parent)) {
    return [expr, tagName, null];
  }

  const grandParent = parent.parent;
  if (grandParent == null) {
    return [expr, tagName, null];
  }
  if (!ts.isPropertyAssignment(grandParent)) {
    return [expr, tagName, null];
  }
  const name = grandParent.name;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return [expr, tagName, name.text];
  }
  return [expr, tagName, null];
}
