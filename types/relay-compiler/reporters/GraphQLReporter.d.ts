export interface GraphQLReporter {
  reportTime(name: string, ms: number): void;
  reportError(caughtLocation: string, error: Error): void;
}
