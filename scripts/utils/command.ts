import { either } from 'fp-ts';
import path from 'path';
import fs from 'fs';

export const findCommand = (
	process: NodeJS.Process,
	pathFromNodeModules: string
): either.Either<Error, string> => {
	const matchingPaths = process.env.NODE_PATH.split(':')
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
