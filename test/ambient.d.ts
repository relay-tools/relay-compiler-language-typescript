declare namespace jest {
  interface Matchers<R> {
    // Used in TypeScriptGenerator-tests.ts
    toMatchFile(width: string): void;
  }
}
