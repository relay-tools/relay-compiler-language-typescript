import { PluginInterface } from 'relay-compiler';

import { formatGeneratedModule } from './formatGeneratedModule';
import { find } from './FindGraphQLTags';
import * as TypeScriptGenerator from './TypeScriptGenerator';

export default function plugin(): PluginInterface {
  return {
    inputExtensions: ['ts', 'tsx'],
    outputExtension: 'ts',
    findGraphQLTags: find,
    formatModule: formatGeneratedModule,
    typeGenerator: TypeScriptGenerator,
  }
}
