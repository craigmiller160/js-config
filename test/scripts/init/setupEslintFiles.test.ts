import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import { setupEslintFiles } from '../../../src/scripts/init/setupEslintFiles';
import {
	PackageJson,
	PackageJsonType
} from '../../../src/scripts/files/PackageJson';
import { ControlFile } from '../../../src/scripts/files/ControlFile';
import { function as func, task, readonlyArray } from 'fp-ts';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'eslint_files'
);
const JS_CONFIG_DIR = path.join(
	WORKING_DIR,
	'node_modules',
	'@craigmiller160',
	'js-config'
);

const wipeWorkingDir = (): Promise<unknown> =>
	func.pipe(
		() => fs.readdir(WORKING_DIR),
		task.map(
			func.flow(
				readonlyArray.filter((fileName) => fileName.includes('eslint')),
				readonlyArray.map((fileName) =>
					path.join(WORKING_DIR, fileName)
				)
			)
		),
		task.flatMap(
			func.flow(
				readonlyArray.map((filePath) => () => fs.rm(filePath)),
				task.sequenceArray
			)
		)
	)();

const writeControlFile = async (
	projectType: PackageJsonType,
	directories: ControlFile['directories']
) => {
	const controlFile: ControlFile = {
		directories,
		projectType,
		eslintPlugins: {
			cypress: false,
			testingLibraryReact: false,
			tanstackQuery: false,
			jestDom: false,
			vitest: false,
			react: false
		},
		workingDirectoryPath: WORKING_DIR
	};
	await fs.writeFile(
		path.join(JS_CONFIG_DIR, 'control-file.json'),
		JSON.stringify(controlFile, null, 2)
	);
};

beforeEach(async () => {
	await wipeWorkingDir();
});

afterEach(async () => {
	await wipeWorkingDir();
})
