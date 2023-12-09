import { ControlFile, getControlFilePath } from '../files/ControlFile';
import fs from 'fs';
import { either } from 'fp-ts';
import { unknownToError } from '../utils/unknownToError';
import { PackageJson } from '../files/PackageJson';
import { logger } from '../logger';

export const generateControlFile = (
	cwd: string,
	packageJson: PackageJson,
	eslintPlugins: ReadonlyArray<string>,
	hasTestDirectory: boolean,
	hasCypressDirectory: boolean,
	process: NodeJS.Process
): either.Either<Error, void> => {
	logger.info('Generating control file');
	const controlFile: ControlFile = {
		workingDirectoryPath: cwd,
		projectType: packageJson.type,
		eslintPlugins,
		hasTestDirectory,
		hasCypressDirectory
	};
	return either.tryCatch(
		() =>
			fs.writeFileSync(
				getControlFilePath(process.cwd()),
				JSON.stringify(controlFile, null, 2)
			),
		unknownToError
	);
};
