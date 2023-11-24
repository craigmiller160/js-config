import { ControlFile, getControlFilePath } from '../files/ControlFile';
import fs from 'fs';
import path from 'path';
import { either } from 'fp-ts';
import { unknownToError } from '../utils/unknownToError';
import { PackageJson } from '../files/PackageJson';
import { logger } from '../logger';

export const generateControlFile = (
	cwd: string,
	packageJson: PackageJson,
	eslintPlugins: ReadonlyArray<string>,
	process: NodeJS.Process
): either.Either<Error, void> => {
	logger.info('Generating control file');
	const hasTestDirectory = fs.existsSync(path.join(cwd, 'test'));
	const controlFile: ControlFile = {
		workingDirectoryPath: cwd,
		projectType: packageJson.type,
		eslintPlugins,
		hasTestDirectory
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
