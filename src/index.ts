import { PluginInterface } from "relay-compiler";

import { find } from "./FindGraphQLTags";
import { formatGeneratedModule } from "./formatGeneratedModule";
import * as TypeScriptGenerator from "./TypeScriptGenerator";

export default function plugin(): PluginInterface {
  return {
    inputExtensions: ["ts", "tsx"],
    outputExtension: "ts",
    findGraphQLTags: find,
    formatModule: formatGeneratedModule,
    typeGenerator: TypeScriptGenerator
  };
}
