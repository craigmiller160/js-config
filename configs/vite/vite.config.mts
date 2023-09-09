import {
	defineConfig as viteDefineConfig,
	mergeConfig,
	UserConfig
} from 'vite';
import path from 'path';
import { function as func, either } from 'fp-ts';
import react from '@vitejs/plugin-react-swc';

const hasLibrary = (name: string): boolean =>
	func.pipe(
		either.tryCatch(() => require.resolve(name), func.identity),
		either.isRight
	);

const defaultConfig = viteDefineConfig({
	root: path.join(process.cwd(), 'src'),
	publicDir: path.join(process.cwd(), 'public'),
	envDir: path.join(process.cwd(), 'environment'),
	test: {
		root: path.join(process.cwd(), 'test')
	},
	build: {
		outDir: path.join(process.cwd(), 'build'),
		emptyOutDir: true
	}
});

const reactConfig = viteDefineConfig({
	plugins: [react()]
});

export const defineConfig = (overrideConfig: UserConfig): UserConfig => {
	const baseConfig = hasLibrary('react')
		? mergeConfig(defaultConfig, reactConfig)
		: defaultConfig;
	return mergeConfig(baseConfig, overrideConfig);
};
