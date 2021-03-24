import { FormatModule } from "relay-compiler";
import * as ts from "typescript";
import addAnyTypeCast from "./addAnyTypeCast";

interface FormatterOptions {
  makeImports: (moduleDetails: Parameters<FormatModule>[0]) => string;
  append?: string;
}

const defaultFormatOptions: FormatterOptions = {
  makeImports({ documentType }) {
    return documentType
      ? `import { ${documentType} } from "relay-runtime";`
      : "";
  },
};

export const formatterFactory = (
  compilerOptions: ts.CompilerOptions = {},
  { makeImports, append }: FormatterOptions = defaultFormatOptions
): FormatModule => (details) => {
  const {
    documentType,
    docText,
    concreteText,
    typeText,
    hash,
    sourceHash,
  } = details;

  const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
  let nodeStatement = `const node: ${
    documentType || "never"
  } = ${concreteText};`;
  if (compilerOptions.noImplicitAny) {
    nodeStatement = addAnyTypeCast(nodeStatement).trim();
  }
  return `/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
${hash ? `/* ${hash} */\n` : ""}
${makeImports(details)}
${typeText || ""}

${docTextComment}
${nodeStatement}
(node as any).hash = '${sourceHash}';
export default node;
${append ? `\n${append}\n` : ""}`;
};
