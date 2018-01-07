import * as path from 'path';

export function getModuleName(filePath: string): string {
	// index.js -> index
	// index.js.flow -> index.js
	let filename = path.basename(filePath, path.extname(filePath));

	// index.js -> index (when extension has multiple segments)
	filename = filename.replace(/(?:\.\w+)+/, '');

	// /path/to/button/index.js -> button
	let moduleName =
		filename === 'index' ? path.basename(path.dirname(filePath)) : filename;

	// Example.ios -> Example
	// Example.product.android -> Example
	moduleName = moduleName.replace(/(?:\.\w+)+/, '');

	// foo-bar -> fooBar
	// Relay compatibility mode splits on _, so we can't use that here.
	moduleName = moduleName.replace(/[^a-zA-Z0-9]+(\w?)/g, (match, next) =>
		next.toUpperCase(),
	);

	return moduleName;
}
