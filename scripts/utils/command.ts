import { either, option, function as func } from 'fp-ts';
import path from 'path';
import fs from 'fs';

const PNPM_PATH_REGEX = /(?<pnpmPath>^.*\/\.pnpm\/).*$/;

const findViaNodePath = (
	process: NodeJS.Process,
	pathFromNodeModules: string
): option.Option<string> => {
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
): option.Option<string> => {};

export const findCommand = (
	process: NodeJS.Process,
	pathFromNodeModules: string
): either.Either<Error, string> =>
	func.pipe(
		findViaNodePath(process, pathFromNodeModules),
		option.fold(
			() => findViaPnpmPath(process, pathFromNodeModules),
			(thePath) => option.some(thePath)
		),
		either.fromOption(
			() => new Error(`Unable to find command: ${pathFromNodeModules}`)
		)
	);
