/// <reference types="vitest" />
import {
	defineConfig as viteDefineConfig,
	mergeConfig,
	UserConfig
} from 'vite';
import path from 'path';
import { either, function as func } from 'fp-ts';
import react from '@vitejs/plugin-react-swc';
import { ServerOptions } from 'https';
import fs from 'fs';

const hasLibrary = (name: string): boolean =>
	func.pipe(
		either.tryCatch(() => require.resolve(name), func.identity),
		either.isRight
	);

const cert = fs.readFileSync(
	path.join(__dirname, 'certs', 'localhost.cert.pem'),
	'utf8'
);
const key = fs.readFileSync(
	path.join(__dirname, 'certs', 'localhost.key.pem', 'utf8')
);
const https: ServerOptions = {
	cert,
	key
};

const defaultConfig = viteDefineConfig({
	root: path.join(process.cwd(), 'src'),
	publicDir: path.join(process.cwd(), 'public'),
	envDir: path.join(process.cwd(), 'environment'),
	test: {
		root: path.join(process.cwd(), 'test')
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
});

const reactConfig = viteDefineConfig({
	plugins: [react()]
});

export const defineConfig = (overrideConfig?: UserConfig): UserConfig => {
	const baseConfig = hasLibrary('react')
		? mergeConfig(defaultConfig, reactConfig)
		: defaultConfig;
	if (overrideConfig) {
		return mergeConfig(baseConfig, overrideConfig);
	}
	return baseConfig;
};
