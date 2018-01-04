declare class GraphQLWatchmanClient {
	public static isAvailable(): Promise<boolean>;

	public constructor();

	command(...args: Array<any>): Promise<any>;

	public hasCapability(capability: string): Promise<boolean>;

	public watchProject(
		baseDir: string,
	): Promise<{
		root: string;
		relativePath: string;
	}>;

	public on(event: string, callback: Function): void;

	end(): void;
}

declare namespace GraphQLWatchmanClient {

}

export = GraphQLWatchmanClient;
export as namespace GraphQLWatchmanClient;
