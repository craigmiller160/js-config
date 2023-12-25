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
const PRETTIER_FILE = /^.+prettier.+$/;
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

type FileNeedsBackup = Readonly<{
	fileName: string;
	needsBackup: boolean;
}>;

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

const needsToBeBackedUp =
	(cwd: string) =>
	(fileName: string): taskEither.TaskEither<Error, FileNeedsBackup> => {
		if (LEGACY_ESLINT.test(fileName)) {
			return taskEither.right({
				fileName,
				needsBackup: true
			});
		}

		const filePath = path.join(cwd, fileName);
		return func.pipe(
			taskEither.tryCatch(
				() => fs.readFile(filePath, 'utf8'),
				either.toError
			),
			taskEither.map((contents) => existingFileIsValid(contents)),
			taskEither.map(
				(isValid): FileNeedsBackup => ({
					fileName,
					needsBackup: !isValid
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
		taskEither.map(groupExistingFiles)
	);
};
