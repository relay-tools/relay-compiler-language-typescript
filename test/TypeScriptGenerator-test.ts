import {generateTestsFromFixtures} from 'relay-test-utils/lib/RelayModernTestUtils'
import * as RelayTestSchema from 'relay-test-utils/lib/RelayTestSchema'
import * as parseGraphQLText from 'relay-test-utils/lib/parseGraphQLText'

import {GraphQLCompilerContext, IRTransforms, transformASTSchema} from 'relay-compiler'

import * as TypeScriptGenerator from '../src/TypeScriptGenerator'

function generate(text, options) {
  const schema = transformASTSchema(RelayTestSchema, [
    IRTransforms.schemaExtensions[1], // RelayMatchTransform.SCHEMA_EXTENSION,
    IRTransforms.schemaExtensions[2], // RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
  ]);
  const {definitions} = parseGraphQLText(schema, text);
  return new GraphQLCompilerContext(RelayTestSchema, schema)
    .addAll(definitions)
    .applyTransforms(TypeScriptGenerator.transforms)
    .documents()
    .map(doc => TypeScriptGenerator.generate(doc, options))
    .join('\n\n');
}

describe('TypeScriptGenerator with a single artifact directory', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/type-generator`, text =>
    generate(text, {
      customScalars: {},
      enumsHasteModule: null,
      existingFragmentNames: new Set(['PhotoFragment']),
      optionalInputFields: [],
      useHaste: false,
      useSingleArtifactDirectory: true,
    }),
  );
});

describe('TypeScriptGenerator without a single artifact directory', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/type-generator`, text =>
    generate(text, {
      customScalars: {},
      enumsHasteModule: null,
      existingFragmentNames: new Set(['PhotoFragment']),
      optionalInputFields: [],
      useHaste: false,
      useSingleArtifactDirectory: false,
    }),
  );
});

describe('Does not add `%future added values` when the noFutureProofEnums option is set', () => {
  const text = `
    fragment ScalarField on User {
      traits
    }
  `;
  const types = generate(text, {
    customScalars: {},
    enumsHasteModule: null,
    existingFragmentNames: new Set(['PhotoFragment']),
    optionalInputFields: [],
    useHaste: false,
    noFutureProofEnums: true,
  });

  // Without the option, PersonalityTraits would be `"CHEERFUL" | ... | "%future added value");`
  expect(types).toContain(
    'export type PersonalityTraits = "CHEERFUL" | "DERISIVE" | "HELPFUL" | "SNARKY";',
  );
});
