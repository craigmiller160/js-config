import * as t from 'io-ts';
import { either, function as func, json } from 'fp-ts';
import fs from 'fs';
import { unknownToError } from '../utils/unknownToError';
import { decode } from '../utils/decode';
import path from 'path';
import { packageJsonTypeCodec } from './PackageJson';
import { match } from 'ts-pattern';

const directoryCodec = t.readonly(
	t.type({
		test: t.boolean,
		cypress: t.boolean
	})
);

const eslintPluginsCodec = t.readonly(
	t.type({
		react: t.boolean,
		testingLibrary: t.boolean,
		testingLibraryReact: t.boolean,
		vitest: t.boolean,
		cypress: t.boolean,
		tanstackQuery: t.boolean
	})
);

export const controlFileCodec = t.readonly(
	t.type({
		workingDirectoryPath: t.string,
		projectType: packageJsonTypeCodec,
		directories: directoryCodec,
		eslintPlugins: eslintPluginsCodec
	})
);

export type EslintPlugins = t.TypeOf<typeof eslintPluginsCodec>;
export type ControlFile = t.TypeOf<typeof controlFileCodec>;

export const getLocalControlFile = (cwd: string): string =>
	path.join(cwd, 'control-file.json');

export const getControlFilePath = (cwd: string): string =>
	path.join(
		cwd,
		'node_modules',
		'@craigmiller160',
		'js-config',
		'control-file.json'
	);

const findControlFile = (
	process: NodeJS.Process
): either.Either<Error, string> =>
	match({
		local: getLocalControlFile(process.cwd()),
		main: getControlFilePath(process.cwd())
	})
		.when(
			({ local }) => fs.existsSync(local),
			({ local }) => either.right(local)
		)
		.when(
			({ main }) => fs.existsSync(main),
			({ main }) => either.right(main)
		)
		.otherwise(() =>
			either.left(new Error('Cannot find valid control file'))
		);

export const parseControlFile = (
	process: NodeJS.Process
): either.Either<Error, ControlFile> =>
	func.pipe(
		findControlFile(process),
		either.chain((controlFile) =>
			either.tryCatch(
				() => fs.readFileSync(controlFile, 'utf8'),
				unknownToError
			)
		),
		either.chain(json.parse),
		either.mapLeft(unknownToError),
		either.chain(decode(controlFileCodec))
	);
