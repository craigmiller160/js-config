import { afterEach, beforeEach, describe, it } from 'vitest';
import path from 'path';
import fs from 'fs';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'vite'
);
const cleanWorkingDir = () =>
	fs
		.readdirSync(WORKING_DIR)
		.filter((fileName) => '.gitkeep' !== fileName)
		.forEach((fileName) =>
			fs.rmSync(path.join(WORKING_DIR, fileName), {
				recursive: true,
				force: true
			})
		);

describe('setupVite', () => {
	beforeEach(() => {
		cleanWorkingDir();
	});

	afterEach(() => {
		cleanWorkingDir();
	});

	it.fails('sets up vite config when none is there');

	it.fails('backs up and replaces old vite config');

	it.fails('does nothing when valid vite config is present');
});
