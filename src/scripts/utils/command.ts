import { either, option, function as func } from 'fp-ts';
import path from 'path';
import fs from 'fs';
import { logger } from '../logger';

const PNPM_PATH_REGEX = /(?<pnpmPath>^.*\/\.pnpm\/).*$/;

const findViaNodePath = (
	process: NodeJS.Process,
	pathFromNodeModules: string
): option.Option<string> => {
	logger.debug('Searching for command via NODE_PATH');
	const matchingPaths = (process.env.NODE_PATH ?? '')
		.split(':')
		.map((thePath) => path.join(thePath, pathFromNodeModules))
		.filter((theFullPath) => fs.existsSync(theFullPath));

	if (matchingPaths.length > 0) {
		return option.some(matchingPaths[0]);
	}
	return option.none;
};

const findViaPnpmPath = (
	process: NodeJS.Process,
	pathFromNodeModules: string
): option.Option<string> => {
	logger.debug('Searching for command in node_modules/.pnpm');
	const pnpmPath = PNPM_PATH_REGEX.exec(process.cwd())?.groups?.pnpmPath;
	if (pnpmPath) {
		const [firstPathElement] = pathFromNodeModules.split('/');

		const matchingLibraries = fs
			.readdirSync(pnpmPath)
			.filter((fileName) => fileName.startsWith(firstPathElement));
		if (matchingLibraries.length > 0) {
			const matchingLibrary =
				matchingLibraries[matchingLibraries.length - 1];
			const fullPathToCommand = path.join(
				pnpmPath,
				matchingLibrary,
				'node_modules',
				pathFromNodeModules
			);

			return option.some(fullPathToCommand);
		}
	}
	return option.none;
};

const findViaRootNodeModules = (
	process: NodeJS.Process,
	pathFromNodeModules: string
): option.Option<string> => {
	logger.debug('Searching for command in node_modules');
	const commandPath = path.join(
		process.cwd(),
		'node_modules',
		pathFromNodeModules
	);
	if (fs.existsSync(commandPath)) {
		return option.some(commandPath);
	}
	return option.none;
};

export const findCommand = (
	process: NodeJS.Process,
	pathFromNodeModules: string
): either.Either<Error, string> => {
	logger.debug(`Finding command: ${pathFromNodeModules}`);
	return func.pipe(
		findViaNodePath(process, pathFromNodeModules),
		option.fold(
			() => findViaPnpmPath(process, pathFromNodeModules),
			(thePath) => option.some(thePath)
		),
		option.fold(
			() => findViaRootNodeModules(process, pathFromNodeModules),
			(thePath) => option.some(thePath)
		),
		either.fromOption(
			() => new Error(`Unable to find command: ${pathFromNodeModules}`)
		)
	);
};
