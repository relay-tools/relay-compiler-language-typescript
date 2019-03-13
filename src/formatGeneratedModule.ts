import { FormatModule } from "relay-compiler";

export const formatterFactory = (): FormatModule => ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  sourceHash
}) => {
  const documentTypeImport = documentType
    ? `import { ${documentType} } from "relay-runtime";`
    : "";
  const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
  const nodeStatement = `const node = (${concreteText}) as ${documentType ||
    "never"};`;
  return `/* tslint:disable */

${documentTypeImport}
${typeText || ""}

${docTextComment}
${nodeStatement}
(node as any).hash = '${sourceHash}';
export default node;
`;
};
