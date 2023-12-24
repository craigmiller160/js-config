import { taskEither, either, function as func, readonlyArray } from 'fp-ts';
import { logger } from '../logger';
import { PackageJson, PackageJsonType } from '../files/PackageJson';
import { glob } from 'glob';
import { match } from 'ts-pattern';
import fs from 'fs/promises';
import path from 'path';

type JsExtension = 'js' | 'cjs';
const BACKUP_FILE = /^.+_backup$/;
const LEGACY_ESLINT = /^\.eslintrc\.(js|cjs)/;
const BASE_FILE_NAME_PATTERN =
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
		taskEither.tryCatch(
			() =>
				glob('*{eslint,prettier}*.*', {
					cwd
				}),
			either.toError
		),
		taskEither.map(
			readonlyArray.filter((fileName) => !BACKUP_FILE.test(fileName))
		)
	);

const existingFileIsValid = (contents: string): boolean =>
	contents.includes('@craigmiller160/js-config');

const moveToBackupFile =
	(cwd: string) =>
	(fileName: string): taskEither.TaskEither<Error, void> => {
		const srcFilePath = path.join(cwd, fileName);
		const baseFileNameGroups = BASE_FILE_NAME_PATTERN.exec(srcFilePath)
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

export const setupEslintFiles = (
	cwd: string,
	packageJson: PackageJson
): taskEither.TaskEither<Error, void> => {
	logger.info('Setting up eslint files');
	const extension = getExtension(packageJson);
	throw new Error();
};
