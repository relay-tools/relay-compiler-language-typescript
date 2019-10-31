declare namespace jest {
  interface Matchers<R, T> {
    // Used in TypeScriptGenerator-tests.ts
    toMatchFile(width: string): void;
  }
}
