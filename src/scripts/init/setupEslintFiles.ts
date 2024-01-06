import { taskEither, either, function as func, readonlyArray } from 'fp-ts';
import { logger } from '../logger';
import { PackageJson, PackageJsonType } from '../files/PackageJson';
import { match } from 'ts-pattern';
import fs from 'fs/promises';
import path from 'path';

type JsExtension = 'js' | 'cjs';
const getExtension = (type: PackageJsonType): JsExtension =>
	match<PackageJsonType, JsExtension>(type)
		.with('commonjs', () => 'js')
		.with('module', () => 'cjs')
		.exhaustive();
const LEGACY_ESLINT = /^\.eslintrc\.(js|cjs)$/;
const EXISTING_CONFIG_FILE =
	/^(?<baseFileName>.*(eslint|prettier).*)\.(js|cjs)$/;
const ESLINT_FILE = /^.*eslint.+$/;

const PRETTIER_CONTENT = `module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`;
export const ESLINT_CJS_CONTENT = `module.exports = import('@craigmiller160/js-config/configs/eslint/eslint.config.mjs').then(
\t({ default: theDefault }) => theDefault
);
`;
export const ESLINT_MJS_CONTENT = `export { default } from '@craigmiller160/js-config/configs/eslint/eslint.config.mjs';\n`;
const getEslintContent = (type: PackageJsonType): string =>
	match<PackageJsonType, string>(type)
		.with('commonjs', () => ESLINT_CJS_CONTENT)
		.with('module', () => ESLINT_MJS_CONTENT)
		.exhaustive();

type BaseFileNameGroups = Readonly<{
	baseFileName: string;
}>;

const getExistingFiles = (
	cwd: string
): taskEither.TaskEither<Error, ReadonlyArray<string>> =>
	func.pipe(
		taskEither.tryCatch(() => fs.readdir(cwd), either.toError),
		taskEither.map(
			readonlyArray.filter((fileName) =>
				EXISTING_CONFIG_FILE.test(fileName)
			)
		)
	);

const existingFileIsValid = (contents: string): boolean =>
	contents.includes('@craigmiller160/js-config');

const moveToBackupFile =
	(cwd: string) =>
	(fileName: string): taskEither.TaskEither<Error, void> => {
		const srcFilePath = path.join(cwd, fileName);
		logger.debug(`Backing up ${srcFilePath}`);
		const baseFileNameGroups = EXISTING_CONFIG_FILE.exec(fileName)
			?.groups as BaseFileNameGroups | undefined;
		if (!baseFileNameGroups) {
			return taskEither.left(
				new Error('Unable to extract base file name for backup file')
			);
		}
		const destFilePath = path.join(
			cwd,
			`${baseFileNameGroups.baseFileName}_backup`
		);
		return taskEither.tryCatch(
			() => fs.rename(srcFilePath, destFilePath),
			either.toError
		);
	};

type ExistingFileType = 'invalid' | 'valid_eslint' | 'valid_prettier';
type ExistingFileAndType = Readonly<{
	fileName: string;
	fileType: ExistingFileType;
}>;

const identifyFileType =
	(cwd: string) =>
	(fileName: string): taskEither.TaskEither<Error, ExistingFileAndType> => {
		if (LEGACY_ESLINT.test(fileName)) {
			return taskEither.right({
				fileName,
				fileType: 'invalid'
			});
		}
		const isEslint = ESLINT_FILE.test(fileName);

		const filePath = path.join(cwd, fileName);
		return func.pipe(
			taskEither.tryCatch(
				() => fs.readFile(filePath, 'utf8'),
				either.toError
			),
			taskEither.map((contents) => existingFileIsValid(contents)),
			taskEither.map((isValid): ExistingFileType => {
				if (!isValid) {
					return 'invalid';
				}

				return isEslint ? 'valid_eslint' : 'valid_prettier';
			}),
			taskEither.map(
				(fileType): ExistingFileAndType => ({
					fileName,
					fileType
				})
			)
		);
	};

type ExistingFiles = Readonly<{
	needBackup: ReadonlyArray<string>;
	hasValidEslint: boolean;
	hasValidPrettier: boolean;
}>;

const groupExistingFiles = (
	files: ReadonlyArray<ExistingFileAndType>
): ExistingFiles => ({
	needBackup: files
		.filter(({ fileType }) => fileType === 'invalid')
		.map(({ fileName }) => fileName),
	hasValidEslint: !!files.find(({ fileType }) => fileType === 'valid_eslint'),
	hasValidPrettier: !!files.find(
		({ fileType }) => fileType === 'valid_prettier'
	)
});

const writeEslintConfigFile = (
	cwd: string,
	type: PackageJsonType,
	hasValidEslint: boolean
): taskEither.TaskEither<Error, void> => {
	if (hasValidEslint) {
		logger.debug('Already has valid eslint config file');
		return taskEither.right(func.constVoid());
	}
	logger.debug('Writing eslint config file');
	const filePath = path.join(cwd, `eslint.config.js`);
	const content = getEslintContent(type);
	return taskEither.tryCatch(
		() => fs.writeFile(filePath, content),
		either.toError
	);
};

const writePrettierConfigFile = (
	cwd: string,
	type: PackageJsonType,
	hasValidPrettier: boolean
): taskEither.TaskEither<Error, void> => {
	if (hasValidPrettier) {
		logger.debug('Already has valid prettier config file');
		return taskEither.right(func.constVoid());
	}
	logger.debug('Writing prettier config file');
	const extension = getExtension(type);
	const filePath = path.join(cwd, `.prettierrc.${extension}`);
	return taskEither.tryCatch(
		() => fs.writeFile(filePath, PRETTIER_CONTENT),
		either.toError
	);
};

const backupFiles =
	(cwd: string) =>
	(existingFiles: ExistingFiles): taskEither.TaskEither<Error, void> =>
		func.pipe(
			existingFiles.needBackup,
			readonlyArray.map(moveToBackupFile(cwd)),
			taskEither.sequenceArray,
			taskEither.map(() => func.constVoid())
		);

const createWriteFileArray =
	(cwd: string, type: PackageJsonType) =>
	(
		existingFiles: ExistingFiles
	): ReadonlyArray<taskEither.TaskEither<Error, void>> => [
		writeEslintConfigFile(cwd, type, existingFiles.hasValidEslint),
		writePrettierConfigFile(cwd, type, existingFiles.hasValidPrettier)
	];

export const setupEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): taskEither.TaskEither<Error, void> => {
	logger.info('Setting up eslint files');
	return func.pipe(
		getExistingFiles(cwd),
		taskEither.flatMap(
			func.flow(
				readonlyArray.map(identifyFileType(cwd)),
				taskEither.sequenceArray
			)
		),
		taskEither.map(groupExistingFiles),
		taskEither.chainFirst(backupFiles(cwd)),
		taskEither.flatMap(
			func.flow(
				createWriteFileArray(cwd, packageJson.type),
				taskEither.sequenceArray
			)
		),
		taskEither.map(() => func.constVoid())
	);
};
