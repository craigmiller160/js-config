import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const TEST_SUPPORT_BUILD_PATH = path.join(
	__dirname,
	'..',
	'build',
	'test-support'
);

fs.readdirSync(TEST_SUPPORT_BUILD_PATH)
	.filter((fileName) => path.extname(fileName) === '.js')
	.forEach((fileName) => {
		const oldPath = path.join(TEST_SUPPORT_BUILD_PATH, fileName);
		const newFileName = `${path.parse(fileName).name}.mjs`;
		const newPath = path.join(TEST_SUPPORT_BUILD_PATH, newFileName);
		fs.renameSync(oldPath, newPath);
	});
