import {
	ControlFile,
	EslintPlugins,
	getLocalControlFile
} from '../files/ControlFile';
import fs from 'fs';
import path from 'path';
import { either, function as func, option } from 'fp-ts';
import { PackageJson, parsePackageJson } from '../files/PackageJson';
import { logger } from '../logger';
import {getPackageJsonPath} from '../../utils/paths';

const JS_CONFIG = '@craigmiller160/js-config';

const checkDirectoryForJsConfig = (directory: string): boolean =>
	func.pipe(
		parsePackageJson(getPackageJsonPath(directory)),
		option.fromEither,
		option.filter((packageJson) => JS_CONFIG === packageJson.name),
		option.isSome
	);

const findJsConfigDirectory = (
	process: NodeJS.Process
): either.Either<Error, string> => {
	if (checkDirectoryForJsConfig(process.cwd())) {
		return either.right(process.cwd());
	}

	const nodeModulesPath = path.join(
		process.cwd(),
		'node_modules',
		'@craigmiller160',
		'js-config'
	);
	if (checkDirectoryForJsConfig(nodeModulesPath)) {
		return either.right(nodeModulesPath);
	}
	return either.left(
		new Error(
			`Cannot find js-config directory from starting directory of ${process.cwd()}`
		)
	);
};

export const generateControlFile = (
	cwd: string,
	packageJson: PackageJson,
	eslintPlugins: EslintPlugins,
	hasTestDirectory: boolean,
	hasCypressDirectory: boolean,
	process: NodeJS.Process
): either.Either<Error, void> => {
	logger.info('Generating control file');
	const controlFile: ControlFile = {
		workingDirectoryPath: cwd,
		projectType: packageJson.type,
		eslintPlugins,
		directories: {
			test: hasTestDirectory,
			cypress: hasCypressDirectory
		}
	};

	const controlFileJson = JSON.stringify(controlFile, null, 2);
	return func.pipe(
		findJsConfigDirectory(process),
		either.map(getLocalControlFile),
		either.chain((controlFilePath) =>
			either.tryCatch(
				() => fs.writeFileSync(controlFilePath, controlFileJson),
				either.toError
			)
		)
	);
};
