import { FormatModule } from "relay-compiler";
import * as ts from "typescript";
import addAnyTypeCast from "./addAnyTypeCast";

export const formatterFactory = (
  compilerOptions: ts.CompilerOptions = {}
): FormatModule => ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  relayRuntimeModule = "relay-runtime",
  sourceHash
}) => {
  const documentTypeImport = documentType
    ? `import { ${documentType} } from "${relayRuntimeModule}";`
    : "";
  const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
  let nodeStatement = `const node = ${concreteText} as ${documentType ||
    "never"};`;
  if (compilerOptions.noImplicitAny) {
    nodeStatement = addAnyTypeCast(nodeStatement).trim();
  }
  return `/* tslint:disable */

${documentTypeImport}
${typeText || ""}

${docTextComment}
${nodeStatement}
(node as any).hash = '${sourceHash}';
export default node;
`;
};
