import {generateTestsFromFixtures} from 'relay-test-utils/lib/RelayModernTestUtils'
import * as RelayTestSchema from 'relay-test-utils/lib/RelayTestSchema'
import * as parseGraphQLText from 'relay-test-utils/lib/parseGraphQLText'

import {GraphQLCompilerContext, IRTransforms, transformASTSchema} from 'relay-compiler'

import * as TypeScriptGenerator from '../src/TypeScriptGenerator'

describe('TypeScriptGenerator', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/type-generator`, text => {
    const schema = transformASTSchema(RelayTestSchema, [
      IRTransforms.schemaExtensions[1], // RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
    ]);
    const {definitions} = parseGraphQLText(schema, text);
    return new GraphQLCompilerContext(RelayTestSchema, schema)
      .addAll(definitions)
      .applyTransforms(TypeScriptGenerator.transforms)
      .documents()
      .map(doc =>
        TypeScriptGenerator.generate(doc, {
          customScalars: {},
          enumsHasteModule: null,
          existingFragmentNames: new Set(['PhotoFragment']),
          inputFieldWhiteList: [],
          relayRuntimeModule: 'relay-runtime',
          useHaste: true,
        }),
      )
      .join('\n\n');
  });
});
