import { afterEach, beforeEach, describe, it } from 'vitest';
import path from 'path';
import fs from 'fs';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'eslint'
);

const wipeWorkingDir = () =>
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

describe('setupEslint', () => {
	beforeEach(() => {
		wipeWorkingDir();
	});

	afterEach(() => {
		wipeWorkingDir();
	});

	it('writes default eslint & prettier config files when none exist', () => {
		throw new Error();
	});

	it("writes default eslint & prettier config files, replacing existing ones that don't reference this lib", () => {
		throw new Error();
	});

	it('do nothing when eslint & prettier config files that reference this lib exist', () => {
		throw new Error();
	});
});
