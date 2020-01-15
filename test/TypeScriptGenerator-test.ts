// @ts-ignore
// TODO - Update CompilerContext type when release @types/relay-compiler 8
import { CompilerContext, IRTransforms, Root } from "relay-compiler";
import { TypeGeneratorOptions } from "relay-compiler/lib/language/RelayLanguagePluginInterface";
import { generateTestsFromFixtures } from "relay-test-utils-internal/lib/generateTestsFromFixtures";
import * as parseGraphQLText from "relay-test-utils-internal/lib/parseGraphQLText";
import { TestSchema } from "relay-test-utils-internal/lib/TestSchema";
import * as TypeScriptGenerator from "../src/TypeScriptGenerator";

function generate(
  text,
  options: TypeGeneratorOptions,
  // TODO - Update CompilerContext type when release @types/relay-compiler 8
  context?
) {
  const schema = TestSchema.extend([
    ...IRTransforms.schemaExtensions,
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
        nameRenderer(supported: [String!]): UserNameRenderer
        nameRenderable(supported: [String!]): UserNameRenderable
        profilePicture(size: [Int], preset: PhotoSize): Image
        screennames: [Screenname]
        subscribeStatus: String
        subscribers(first: Int): SubscribersConnection
        url(relative: Boolean, site: String): String
        websites: [String]
        username: String
      }
    `
  ]);
  const { definitions, schema: extendedSchema } = parseGraphQLText(
    schema,
    text
  );
  return new CompilerContext(extendedSchema)
    .addAll(definitions)
    .applyTransforms(TypeScriptGenerator.transforms)
    .documents()
    .map(
      doc =>
        `// ${doc.name}.graphql\n${TypeScriptGenerator.generate(
          extendedSchema,
          doc as any,
          {
            ...options,
            normalizationIR: context
              ? (context.get(doc.name) as Root)
              : undefined
          }
        )}`
    )
    .join("\n\n");
}

describe("Snapshot tests", () => {
  function generateContext(text) {
    const relaySchema = TestSchema.extend(IRTransforms.schemaExtensions);
    const { definitions, schema: extendedSchema } = parseGraphQLText(
      relaySchema,
      text
    );
    return new CompilerContext(extendedSchema)
      .addAll(definitions)
      .applyTransforms([
        ...IRTransforms.commonTransforms,
        ...IRTransforms.queryTransforms,
        ...IRTransforms.codegenTransforms
      ]);
  }

  describe("TypeScriptGenerator with a single artifact directory", () => {
    generateTestsFromFixtures(`${__dirname}/fixtures/type-generator`, text => {
      const context = generateContext(text);
      return generate(
        text,
        {
          customScalars: {},
          // enumsHasteModule: null,
          existingFragmentNames: new Set(["PhotoFragment"]),
          optionalInputFields: [],
          useHaste: false,
          useSingleArtifactDirectory: true,
          noFutureProofEnums: false
        },
        context
      );
    });
  });

  describe("TypeScriptGenerator without a single artifact directory", () => {
    generateTestsFromFixtures(`${__dirname}/fixtures/type-generator`, text => {
      const context = generateContext(text);
      return generate(
        text,
        {
          customScalars: {},
          // enumsHasteModule: null,
          existingFragmentNames: new Set(["PhotoFragment"]),
          optionalInputFields: [],
          useHaste: false,
          useSingleArtifactDirectory: false,
          noFutureProofEnums: false
        },
        context
      );
    });
  });
});

describe("Does not add `%future added values` when the noFutureProofEnums option is set", () => {
  const text = `
    fragment ScalarField on User {
      traits
    }
  `;
  const types = generate(text, {
    customScalars: {},
    // enumsHasteModule: null,
    existingFragmentNames: new Set(["PhotoFragment"]),
    optionalInputFields: [],
    useHaste: true,
    useSingleArtifactDirectory: false,
    // This is what's different from the tests above.
    noFutureProofEnums: true
  });

  // Without the option, PersonalityTraits would be `"CHEERFUL" | ... | "%future added value");`
  expect(types).toContain(
    'export type PersonalityTraits = "CHEERFUL" | "DERISIVE" | "HELPFUL" | "SNARKY";'
  );
});

describe.each`
  mapping     | type
  ${"String"} | ${"string"}
  ${"Url"}    | ${"string"}
  ${"ID"}     | ${"string"}
  ${"Int"}    | ${"number"}
  ${"Color"}  | ${"Color"}
  ${"{}"}     | ${"{}"}
  ${"[]"}     | ${"[]"}
`("Custom scalar mapping $mapping to $type", ({ mapping, type }) => {
  const text = `
    fragment Test on User {
        color
    }
  `;
  const types = generate(text, {
    customScalars: {
      Color: mapping
    },
    // enumsHasteModule: null,
    existingFragmentNames: new Set(["PhotoFragment"]),
    optionalInputFields: [],
    useHaste: false,
    useSingleArtifactDirectory: true,
    noFutureProofEnums: false
  });

  expect(types).toContain(`color: ${type} | null`);
});
