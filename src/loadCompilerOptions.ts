import * as ts from "typescript";

export const loadCompilerOptions = (): ts.CompilerOptions => {
  const configFileName = ts.findConfigFile(process.cwd(), ts.sys.fileExists);
  if (!configFileName) {
    return {};
  }
  const result = ts.readConfigFile(configFileName, ts.sys.readFile);
  if (result.error) {
    return {};
  }
  return result.config.compilerOptions;
};
