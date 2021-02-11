declare namespace jest {
  interface Matchers<R, T> {
    // Used in TypeScriptGenerator-tests.ts
    toMatchFile(width: string): void;
  }
}


declare module "relay-test-utils-internal/lib/generateTestsFromFixtures" {

  export function generateTestsFromFixtures(path: string, callback: (text: string) => void): void
}

declare module "relay-test-utils-internal/lib/parseGraphQLText" {
  import type {Fragment, Root, Schema} from 'relay-compiler';
  function parseGraphQLText(schema: Schema, text: string): { definitions: ReadonlyArray<Fragment | Root>, schema: Schema }
  export = parseGraphQLText
}

declare module "relay-test-utils-internal/lib/TestSchema" {
  import type {Schema} from 'relay-compiler';
  export const TestSchema: Schema
}
