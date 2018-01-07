import { GraphQLReporter } from './GraphQLReporter';

declare class GraphQLConsoleReporter implements GraphQLReporter {

	constructor(options: { verbose: boolean });

	reportTime(name: string, ms: number): void;

	reportError(caughtLocation: string, error: Error): void;
}
declare namespace GraphQLConsoleReporter {

}
export = GraphQLConsoleReporter;
export as namespace GraphQLConsoleReporter;
