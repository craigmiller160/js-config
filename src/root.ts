import path from 'path';
import fs from 'fs';

export const getProjectRoot = (currentDir: string = __dirname): string => {
	const rootSrcPath = path.join(currentDir, 'src');
	const rootBuildPath = path.join(currentDir, 'lib');
	if (fs.existsSync(rootSrcPath) || fs.existsSync(rootBuildPath)) {
		return currentDir;
	}
	return getProjectRoot(path.join(currentDir, '..'));
};
