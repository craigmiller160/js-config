/// <reference types="vitest" />
import { mergeConfig, UserConfig, UserConfigFnPromise } from 'vite';
import path from 'path';
import { task, taskEither, function as func } from 'fp-ts';
import react from '@vitejs/plugin-react-swc';
import { ServerOptions } from 'https';
import fs from 'fs';
import { getProjectRoot } from '../root.js';

const hasLibrary = (name: string): Promise<boolean> =>
	func.pipe(
		taskEither.tryCatch(() => import(name), func.identity),
		taskEither.fold(
			() => task.of(false),
			() => task.of(true)
		)
	)();

const cert = fs.readFileSync(
	path.join(__dirname, 'certs', 'localhost.cert.pem'),
	'utf8'
);
const key = fs.readFileSync(
	path.join(__dirname, 'certs', 'localhost.key.pem'),
	'utf8'
);
const https: ServerOptions = {
	cert,
	key
};

const getJestFpTsPath = () => {
	const root = getProjectRoot();
	return path.join(root, 'configs', 'test-support', 'jest-fp-ts.mts');
};

const getTestingLibraryJestDomPath = () => {
	const root = getProjectRoot();
	return path.join(
		root,
		'configs',
		'test-support',
		'testing-library-jest-dom.mts'
	);
};

const getTestingLibraryReactPath = () => {
	const root = getProjectRoot();
	return path.join(
		root,
		'configs',
		'test-support',
		'testing-library-react.mts'
	);
};

const noop = path.join(__dirname, 'noop.js');

const createDefaultConfig = async (): Promise<UserConfig> => {
	const hasJestFpTs = await hasLibrary(
		'@relmify/jest-fp-ts/dist/decodeMatchers/index.js'
	);
	const hasJestDom = await hasLibrary('@testing-library/jest-dom/matchers');
	const hasRtl = await hasLibrary('@testing-library/react');
	return {
		root: path.join(process.cwd(), 'src'),
		publicDir: path.join(process.cwd(), 'public'),
		envDir: path.join(process.cwd(), 'environment'),
		test: {
			root: path.join(process.cwd(), 'test'),
			setupFiles: [
				hasJestFpTs ? getJestFpTsPath() : noop,
				hasJestDom ? getTestingLibraryJestDomPath() : noop,
				hasRtl ? getTestingLibraryReactPath() : noop
			]
		},
		server: {
			port: 3000,
			host: true,
			https
		},
		build: {
			outDir: path.join(process.cwd(), 'build'),
			emptyOutDir: true
		}
	};
};

const reactConfig: UserConfig = {
	plugins: [react()]
};

export const defineConfig =
	(overrideConfig?: UserConfig): UserConfigFnPromise =>
	async () => {
		const defaultConfig = await createDefaultConfig();
		const baseConfig = (await hasLibrary('react'))
			? mergeConfig(defaultConfig, reactConfig)
			: defaultConfig;
		if (overrideConfig) {
			return mergeConfig(baseConfig, overrideConfig);
		}
		return baseConfig;
	};
