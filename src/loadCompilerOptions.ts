import * as ts from "typescript";

export const loadCompilerOptions = (): ts.CompilerOptions => {
  const configFileName = ts.findConfigFile(process.cwd(), ts.sys.fileExists);
  if (!configFileName) {
    throw new Error("Could not find config file!");
  }

  const result = ts.readConfigFile(configFileName, ts.sys.readFile);
  if (result.error) {
    let message;
    if (typeof result.error.messageText === "string") {
      message = result.error.messageText;
    } else {
      message = result.error.messageText.messageText;
    }
    throw new Error(message);
  }
  return result.config.compilerOptions;
};
