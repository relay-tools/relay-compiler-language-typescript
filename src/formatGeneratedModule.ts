import { FormatModule } from "relay-compiler";
import * as ts from "typescript";
import addAnyTypeCast from "./addAnyTypeCast";

const createRequireRegex = () => /require\("(.*)"\)/g;
const escapeRegexString = (str: string) =>
  str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

// collects all require calls and converts them to top level imports
const requireToImport = (content: string) => {
  const requirePaths = new Set<string>();
  const regex = createRequireRegex();
  let result: null | RegExpExecArray = null;
  while (true) {
    result = regex.exec(content);
    if (result === null) {
      break;
    }
    requirePaths.add(result[1]);
  }

  for (const requirePath of requirePaths) {
    const [baseName] = requirePath.replace("./", "").split(".");
    content =
      `import ${baseName} from "${requirePath.replace(".ts", "")}";\n` +
      content.replace(
        new RegExp(escapeRegexString(`require('${requirePath}')`), "g"),
        baseName
      );
  }

  return content;
};

export const formatterFactory = (
  compilerOptions: ts.CompilerOptions = {}
): FormatModule => ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  sourceHash,
}) => {
  const documentTypeImport = documentType
    ? `import { ${documentType} } from "relay-runtime";`
    : "";
  const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
  let nodeStatement = `const node: ${
    documentType || "never"
  } = ${concreteText};`;
  if (compilerOptions.noImplicitAny) {
    nodeStatement = addAnyTypeCast(nodeStatement).trim();
  }
  const rawContent = `${typeText || ""}

${docTextComment}
${nodeStatement}
(node as any).hash = '${sourceHash}';
export default node;
`;

  const content = `/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
${hash ? `/* ${hash} */\n` : ""}
${documentTypeImport}
${requireToImport(rawContent)}`;
  return content;
};
