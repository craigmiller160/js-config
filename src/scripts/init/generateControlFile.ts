import {
	ControlFile,
	EslintPlugins,
	getLocalControlFile
} from '../files/ControlFile';
import fs from 'fs';
import { either } from 'fp-ts';
import { PackageJson } from '../files/PackageJson';
import { logger } from '../logger';

export const generateControlFile = (
	cwd: string,
	packageJson: PackageJson,
	eslintPlugins: EslintPlugins,
	hasTestDirectory: boolean,
	hasCypressDirectory: boolean,
	process: NodeJS.Process
): either.Either<Error, void> => {
	logger.info('Generating control file');
	const controlFile: ControlFile = {
		workingDirectoryPath: cwd,
		projectType: packageJson.type,
		eslintPlugins,
		directories: {
			test: hasTestDirectory,
			cypress: hasCypressDirectory
		}
	};
	return either.tryCatch(
		() =>
			fs.writeFileSync(
				// It's not really local, pnpm has cwd being the node_modules location of this lib
				getLocalControlFile(process.cwd()),
				JSON.stringify(controlFile, null, 2)
			),
		either.toError
	);
};
