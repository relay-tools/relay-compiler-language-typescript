declare namespace CodegenDirectory {
	export interface Changes {
		deleted: Array<string>;
		updated: Array<string>;
		created: Array<string>;
		unchanged: Array<string>;
	}
}

/**
 * CodegenDirectory is a helper class for scripts that generate code into one
 * output directory. The purpose is to make it easy to only write files that
 * have changed and delete files that are no longer generated.
 * It gives statistics about added/removed/updated/unchanged in the end.
 * The class also has an option to "validate" which means that no file
 * operations are performed and only the statistics are created for what would
 * have happened. If there's anything but "unchanged", someone probably forgot
 * to run the codegen script.
 *
 * Example:
 *
 *   const dir = new CodegenDirectory('/some/path/generated');
 *   // write files in case content changed (less watchman/mtime changes)
 *   dir.writeFile('OneFile.js', contents);
 *   dir.writeFile('OtherFile.js', contents);
 *
 *   // delete files that are not generated
 *   dir.deleteExtraFiles();
 *
 *   // arrays of file names to print or whatever
 *   dir.changes.created
 *   dir.changes.updated
 *   dir.changes.deleted
 *   dir.changes.unchanged
 */
declare class CodegenDirectory {
	changes: CodegenDirectory.Changes;
	onlyValidate: boolean;

	public constructor(
		dir: string,
		options?: {
			onlyValidate?: boolean;
		},
	);

	static combineChanges(dirs: Array<CodegenDirectory>): CodegenDirectory.Changes;

	static hasChanges(changes: CodegenDirectory.Changes): boolean;

	static printChanges(changes: CodegenDirectory.Changes, options: { onlyValidate: boolean }): void;

	printChanges(): void;

	read(filename: string): string | null;

	markUnchanged(filename: string): void;

	/**
	 * Marks a files as updated or out of date without actually writing the file.
	 * This is probably only be useful when doing validation without intention to
	 * actually write to disk.
	 */
	markUpdated(filename: string): void;

	writeFile(filename: string, content: string): void;

	/**
	 * Deletes all non-generated files, except for invisible "dot" files (ie.
	 * files with names starting with ".").
	 */
	deleteExtraFiles(): void;

	getPath(filename: string): string;
}
export = CodegenDirectory;
export as namespace CodegenDirectory;
