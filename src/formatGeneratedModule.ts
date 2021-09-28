import { FormatModule } from "relay-compiler";
import * as ts from "typescript";
import addAnyTypeCast from "./addAnyTypeCast";

const createRequireRegex = () => /require\('(.*)'\)/g;

function getModuleName(path: string) {
  const [moduleName] = path.replace("./", "").split(".");
  return moduleName;
}

// collects all require calls and converts them top-level imports
const requireToImport = (content: string): string => {
  const requireRegex = createRequireRegex();

  // collect all require paths (unique)
  const requirePaths = new Set<string>();
  while (true) {
    const res = requireRegex.exec(content);
    if (res === null) {
      break;
    }
    requirePaths.add(res[1]);
  }
  // replace all require paths
  Array.from(requirePaths).forEach((requirePath) => {
    content = content.replace(
      `require('${requirePath}')`,
      getModuleName(requirePath)
    );
  });
  // create top-level imports
  const topLevelImports = Array.from(requirePaths)
    .sort()
    .map(
      (requirePath) =>
        `import ${getModuleName(requirePath)} from "${requirePath.replace(
          ".ts",
          ""
        )}";`
    );
  // add top-level imports
  content = `${topLevelImports.join("\n")}
${content}`;
  return content;
};

type FormatContentOptions = {
  replaceRequire: boolean;
};

function formatContent(
  rawContent: string,
  options: FormatContentOptions
): string {
  if (!options.replaceRequire) {
    return rawContent;
  }
  return requireToImport(rawContent);
}

export const formatterFactory =
  (compilerOptions: ts.CompilerOptions = {}): FormatModule =>
  ({
    moduleName,
    documentType,
    docText,
    concreteText,
    typeText,
    hash,
    sourceHash,
  }) => {
    const { noImplicitAny, module = -1 } = compilerOptions;

    const documentTypeImport = documentType
      ? `import { ${documentType} } from "relay-runtime";`
      : "";
    const docTextComment = docText ? "\n/*\n" + docText.trim() + "\n*/\n" : "";
    let nodeStatement = `const node: ${
      documentType || "never"
    } = ${concreteText};`;
    if (noImplicitAny) {
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
${formatContent(rawContent, {
  replaceRequire: module >= ts.ModuleKind.ES2015,
})}`;
    return content;
  };
