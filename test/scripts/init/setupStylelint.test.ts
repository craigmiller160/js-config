import { afterEach, beforeEach, describe, it } from 'vitest';
import path from 'path';
import fs from 'fs';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'stylelint'
);
const clearDirectory = () =>
	fs
		.readdirSync(WORKING_DIR)
		.filter((fileName) => '.gitkeep' !== fileName)
		.map((fileName) => path.join(WORKING_DIR, fileName))
		.forEach((filePath) =>
			fs.rmSync(filePath, {
				recursive: true,
				force: true
			})
		);

describe('setupStylelint', () => {
	beforeEach(() => {
		clearDirectory();
	});
	afterEach(() => {
		clearDirectory();
	});
	it.fails('sets up stylelint config file');

	it.fails('replaces existing config file if invalid');

	it.fails('does nothing if stylelint config already exists');
});
