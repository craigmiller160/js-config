/// <reference types="vitest" />
import { mergeConfig, UserConfig, UserConfigFnPromise } from 'vite';
import path from 'path';
import { task, taskEither, function as func } from 'fp-ts';
import react from '@vitejs/plugin-react-swc';
import { ServerOptions } from 'https';
import fs from 'fs';

const hasLibrary = (name: string): Promise<boolean> =>
	func.pipe(
		taskEither.tryCatch(() => import(name), func.identity),
		taskEither.fold(
			(ex) => {
				throw ex;
			},
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

const JEST_FP_TS_SRC_PATH = path.join(
	__dirname,
	'..',
	'..',
	'configs',
	'test-support',
	'jest-fp-ts.mts'
);

const JEST_FP_TS_BUILD_PATH = path.join(
	__dirname,
	'..',
	'..',
	'..',
	'configs',
	'test-support',
	'jest-fp-ts.mts'
);

const JEST_DOM_SRC_PATH = path.join(
	__dirname,
	'..',
	'..',
	'configs',
	'test-support',
	'testing-library-jest-dom.mts'
);
const JEST_DOM_BUILD_PATH = path.join(
	__dirname,
	'..',
	'..',
	'..',
	'configs',
	'test-support',
	'testing-library-jest-dom.mts'
);

const getJestFpTsPath = () => {
	if (fs.existsSync(JEST_FP_TS_SRC_PATH)) {
		return JEST_FP_TS_SRC_PATH;
	}
	return JEST_FP_TS_BUILD_PATH;
};

const getJestDomPath = () => {
	if (fs.existsSync(JEST_DOM_SRC_PATH)) {
		return JEST_DOM_SRC_PATH;
	}
	return JEST_DOM_BUILD_PATH;
};

const noop = path.join(__dirname, 'noop.js');

const createDefaultConfig = async (): Promise<UserConfig> => {
	const hasJestFpTs = await hasLibrary(
		'@relmify/jest-fp-ts/dist/decodeMatchers/index.js'
	);
	const hasJestDom = await hasLibrary('@testing-library/jest-dom/matchers');
	return {
		root: path.join(process.cwd(), 'src'),
		publicDir: path.join(process.cwd(), 'public'),
		envDir: path.join(process.cwd(), 'environment'),
		test: {
			root: path.join(process.cwd(), 'test'),
			setupFiles: [
				hasJestFpTs ? getJestFpTsPath() : noop,
				hasJestDom ? getJestDomPath() : noop
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
