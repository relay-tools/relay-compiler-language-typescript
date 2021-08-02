import { PluginInterface } from "relay-compiler/lib/language/RelayLanguagePluginInterface";
import { find } from "./FindGraphQLTags";
import { formatterFactory } from "./formatGeneratedModule";
import { loadCompilerOptions } from "./loadCompilerOptions";
import * as TypeScriptGenerator from "./TypeScriptGenerator";

export default function plugin(): PluginInterface {
  return {
    inputExtensions: ["ts", "tsx"],
    outputExtension: "ts",
    findGraphQLTags: find,
    formatModule: formatterFactory(loadCompilerOptions()),
    typeGenerator: TypeScriptGenerator,
  };
}
