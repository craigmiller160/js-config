import path from 'path';
import fs from 'fs';

export const getProjectRoot = (currentDir: string = __dirname): string => {
	const rootSrcPath = path.join(currentDir, '..');
	const rootBuildPath = path.join(currentDir, '..', '..', '..');
    console.log(rootSrcPath);
	if (fs.existsSync(path.join(rootSrcPath, 'src'))) {
		return rootSrcPath;
	}
	return rootBuildPath;
};
