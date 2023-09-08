import { ControlFile, getControlFilePath } from '../files/ControlFile';
import fs from 'fs';
import { either } from 'fp-ts';
import { unknownToError } from '../utils/unknownToError';
import { PackageJson } from '../files/PackageJson';

export const generateControlFile = (
	cwd: string,
	packageJson: PackageJson,
	eslintPlugins: ReadonlyArray<string>,
	process: NodeJS.Process
): either.Either<Error, void> => {
	const controlFile: ControlFile = {
		workingDirectoryPath: cwd,
		projectType: packageJson.type ?? 'commonjs',
		eslintPlugins
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
