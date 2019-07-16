import {generateTestsFromFixtures} from 'relay-test-utils/lib/RelayModernTestUtils'
import * as RelayTestSchema from 'relay-test-utils/lib/RelayTestSchema'
import * as parseGraphQLText from 'relay-test-utils/lib/parseGraphQLText'

import {GraphQLCompilerContext, IRTransforms, transformASTSchema} from 'relay-compiler'

import * as TypeScriptGenerator from '../src/TypeScriptGenerator'

function generate(text, options) {
  const schema = transformASTSchema(RelayTestSchema, [
    IRTransforms.schemaExtensions[1], // RelayMatchTransform.SCHEMA_EXTENSION,
    IRTransforms.schemaExtensions[2], // RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
    `
      scalar Color
      extend type User {
        color: Color
      }
      type ExtraUser implements Actor {
        address: StreetAddress
        allPhones: [Phone]
        birthdate: Date
        emailAddresses: [String]
        firstName(if: Boolean, unless: Boolean): String
        friends(after: ID, before: ID, first: Int, last: Int, orderby: [String], find: String, isViewerFriend: Boolean, if: Boolean, unless: Boolean, traits: [PersonalityTraits]): FriendsConnection
        hometown: Page
        id: ID!
        lastName: String
        name: String
        nameRenderer(supported: [String!]!): UserNameRenderer
        nameRenderable(supported: [String!]!): UserNameRenderable
        profilePicture(size: [Int], preset: PhotoSize): Image
        screennames: [Screenname]
        subscribeStatus: String
        subscribers(first: Int): SubscribersConnection
        url(relative: Boolean, site: String): String
        websites: [String]
        username: String
      }
    `,
  ]);
  const {definitions} = parseGraphQLText(schema, text);
  return new GraphQLCompilerContext(RelayTestSchema, schema)
    .addAll(definitions)
    .applyTransforms(TypeScriptGenerator.transforms)
    .documents()
    .map(doc => TypeScriptGenerator.generate(doc, {
      ...options,
      schema,
    }))
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
