import { FormatModule } from "relay-compiler";
import * as ts from "typescript";
import addAnyTypeCast from "./addAnyTypeCast";

export const formatterFactory = (
  compilerOptions: ts.CompilerOptions = {}
): FormatModule => ({
  documentType,
  docText,
  concreteText,
  typeText,
  relayRuntimeModule = "relay-runtime",
  sourceHash,
  devOnlyAssignments
}) => {
  const documentTypeImport = documentType
    ? `import { ${documentType} } from "${relayRuntimeModule}";`
    : "";
  const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
  let nodeStatement = `const node: ${documentType ||
    "never"} = ${concreteText};`;
  if (compilerOptions.noImplicitAny) {
    nodeStatement = addAnyTypeCast(nodeStatement).trim();
  }
  const devOnlyAssignmentsText =
    devOnlyAssignments != null && devOnlyAssignments.length > 0
      ? `\nif (process.env.NODE_ENV !== 'production') {\n  ${devOnlyAssignments.replace(
          // `devOnlyAssignments` uses a flow comment, we can simply replace it with a
          // ts cast.
          "(node/*: any*/)",
          "(node as any)"
        )}\n}`
      : "";
  return `/* tslint:disable */

${documentTypeImport}
${typeText || ""}

${docTextComment}
${nodeStatement}
${devOnlyAssignmentsText}
(node as any).hash = '${sourceHash}';
export default node;
`;
};
