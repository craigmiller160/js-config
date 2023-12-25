import { taskEither, either, function as func, readonlyArray } from 'fp-ts';
import { logger } from '../logger';
import { PackageJson, PackageJsonType } from '../files/PackageJson';
import { match } from 'ts-pattern';
import fs from 'fs/promises';
import path from 'path';

type JsExtension = 'js' | 'cjs';
const LEGACY_ESLINT = /^\.eslintrc\.(js|cjs)$/;
const EXISTING_CONFIG_FILE =
	/^(?<baseFileName>.+(eslint|prettier).+)\.(js|cjs)$/;
const ESLINT_FILE = /^.+eslint.+$/;

const PRETTIER_CONTENT = `module.exports = require('@craigmiller160/js-config/configs/eslint/.prettierrc.js');`;
const ESLINT_CONTENT = `module.exports = import('@craigmiller160/js-config/configs/eslint/eslint.config.mjs').then(
\t({ default: theDefault }) => theDefault
);
`;

type BaseFileNameGroups = Readonly<{
	baseFileName: string;
}>;

const getExtension = (packageJson: PackageJson): JsExtension =>
	match<PackageJsonType, JsExtension>(packageJson.type)
		.with('commonjs', () => 'js')
		.with('module', () => 'cjs')
		.exhaustive();

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
		const baseFileNameGroups = EXISTING_CONFIG_FILE.exec(srcFilePath)
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
	extension: string,
	hasValidEslint: boolean
): taskEither.TaskEither<Error, void> => {
	if (hasValidEslint) {
		return taskEither.right(func.constVoid());
	}
	const filePath = path.join(cwd, `eslint.config.${extension}`);
	return taskEither.tryCatch(
		() => fs.writeFile(filePath, ESLINT_CONTENT),
		either.toError
	);
};

const writePrettierConfigFile = (
	cwd: string,
	extension: string,
	hasValidPrettier: boolean
): taskEither.TaskEither<Error, void> => {
	if (hasValidPrettier) {
		return taskEither.right(func.constVoid());
	}
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
	(cwd: string, extension: string) =>
	(
		existingFiles: ExistingFiles
	): ReadonlyArray<taskEither.TaskEither<Error, void>> => [
		writeEslintConfigFile(cwd, extension, existingFiles.hasValidEslint),
		writePrettierConfigFile(cwd, extension, existingFiles.hasValidPrettier)
	];

export const setupEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): taskEither.TaskEither<Error, void> => {
	logger.info('Setting up eslint files');
	const extension = getExtension(packageJson);
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
				createWriteFileArray(cwd, extension),
				taskEither.sequenceArray
			)
		),
		taskEither.map(() => func.constVoid())
	);
};
