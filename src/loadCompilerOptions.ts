import * as ts from "typescript";

export const loadCompilerOptions = (): ts.CompilerOptions => {
  const configFileName = ts.findConfigFile(process.cwd(), ts.sys.fileExists);
  if (!configFileName) {
    return {};
  }
  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
  if (configFile.error) {
    return {};
  }
  // parse config file contents (to convert strings to enum values etc.)
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    "./"
  );
  if (parsedConfig.errors.length > 0) {
    return {};
  }
  return parsedConfig.options;
};
