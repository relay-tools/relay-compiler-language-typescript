import { File } from './CodegenTypes';
import * as GraphQLWatchmanClient from '../core/GraphQLWatchmanClient';

export type WatchmanExpression = Array<string | Array<string>>;

export type FileFilter = (file: File) => boolean;

type WatchmanChange = {
	name: string;
	exists: boolean;
	'content.sha1hex': string | undefined | null;
};
type WatchmanChanges = {
	files?: Array<WatchmanChange>;
};

export function queryFiles(baseDir: string, expression: WatchmanExpression, filter: FileFilter): Promise<Set<File>>;

// For use when not using Watchman.
export function queryFilepaths(baseDir: string, filepaths: Array<string>, filter: FileFilter): Promise<Set<File>>;

/**
 * Provides a simplified API to the watchman API.
 * Given some base directory and a list of subdirectories it calls the callback
 * with watchman change events on file changes.
 */
export function watch(
	baseDir: string,
	expression: WatchmanExpression,
	callback: (changes: WatchmanChanges) => any,
): Promise<void>;

/**
 * Further simplifies `watch` and calls the callback on every change with a
 * full list of files that match the conditions.
 */
export function watchFiles(
	baseDir: string,
	expression: WatchmanExpression,
	filter: FileFilter,
	callback: (files: Set<File>) => any,
): Promise<void>;

/**
 * Similar to watchFiles, but takes an async function. The `compile` function
 * is awaited and not called in parallel. If multiple changes are triggered
 * before a compile finishes, the latest version is called after the compile
 * finished.
 *
 * TODO: Consider changing from a Promise to abortable, so we can abort mid
 *       compilation.
 */
export function watchCompile(
	baseDir: string,
	expression: WatchmanExpression,
	filter: FileFilter,
	compile: (files: Set<File>) => Promise<any>,
): Promise<void>;
