import { either } from 'fp-ts';
import path from 'path';
import fs from 'fs';

const getNodePath = (process: NodeJS.Process): string =>
	process.env.NODE_PATH ?? path.join(process.cwd(), 'node_modules');

export const findCommand = (
	process: NodeJS.Process,
	pathFromNodeModules: string
): either.Either<Error, string> => {
	const matchingPaths = getNodePath(process)
		.split(':')
		.map((thePath) => path.join(thePath, pathFromNodeModules))
		.filter((theFullPath) => fs.existsSync(theFullPath));

	if (matchingPaths.length === 0) {
		return either.left(
			new Error(
				`Unable to find command on NODE_PATH: ${pathFromNodeModules}`
			)
		);
	}
	return either.right(matchingPaths[0]);
};
