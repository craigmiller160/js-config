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

const backupExistingFilesIfNecessary =
	(cwd: string) =>
	(
		files: ReadonlyArray<FileNeedsBackup>
	): taskEither.TaskEither<Error, void> =>
		func.pipe(
			files,
			readonlyArray.filter(({ needsBackup }) => needsBackup),
			readonlyArray.map(({ fileName }) => fileName),
			readonlyArray.map(moveToBackupFile(cwd)),
			taskEither.sequenceArray,
			taskEither.map(() => func.constVoid())
		);

const handleExistingFiles = (cwd: string): taskEither.TaskEither<Error, void> =>
	func.pipe(
		getExistingFiles(cwd),
		taskEither.flatMap(backupExistingFilesIfNecessary(cwd))
	);

export const setupEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): taskEither.TaskEither<Error, void> => {
	logger.info('Setting up eslint files');
	const extension = getExtension(packageJson);
	func.pipe(
		getExistingFiles(cwd),
		taskEither.flatMap(
			func.flow(
				readonlyArray.map(needsToBeBackedUp(cwd)),
				taskEither.sequenceArray
			)
		),
		taskEither.chainFirst(backupExistingFilesIfNecessary(cwd))
	);
};
