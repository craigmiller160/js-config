import path from 'path';
import fs from 'fs';

const ROOT_SRC_PATH = path.join(__dirname, '..', '..');
const ROOT_BUILD_PATH = path.join(__dirname, '..', '..', '..');
export const getProjectRoot = (): string => {
	if (fs.existsSync(path.join(ROOT_SRC_PATH, 'src'))) {
		return ROOT_SRC_PATH;
	}
	return ROOT_BUILD_PATH;
};
