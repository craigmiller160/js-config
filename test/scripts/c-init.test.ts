import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { setupTypescript } from '../../src/scripts/init/setupTypescript';
import { findCwd } from '../../src/scripts/utils/cwd';
import { terminate } from '../../src/scripts/utils/terminate';
import { either, function as func, taskEither } from 'fp-ts';
import { execute } from '../../src/scripts/c-init';
import {
	PackageJson,
	parsePackageJson
} from '../../src/scripts/files/PackageJson';
import path from 'path';
import { generateControlFile } from '../../src/scripts/init/generateControlFile';
import { setupEslintFiles } from '../../src/scripts/init/setupEslintFiles';
import { setupEslintPlugins } from '../../src/scripts/init/setupEslintPlugins';
import { setupVite } from '../../src/scripts/init/setupVite';
import { setupGitHooks } from '../../src/scripts/init/setupGitHooks';
import { setupStylelint } from '../../src/scripts/init/setupStylelint';
import { ControlFile } from '../../src/scripts/files/ControlFile';

const findCwdMock = findCwd as MockedFunction<typeof findCwd>;
const setupTypescriptMock = setupTypescript as MockedFunction<
	typeof setupTypescript
>;
const parsePackageJsonMock = parsePackageJson as MockedFunction<
	typeof parsePackageJson
>;
const generateControlFileMock = generateControlFile as MockedFunction<
	typeof generateControlFile
>;
const setupEslintFilesMock = setupEslintFiles as MockedFunction<
	typeof setupEslintFiles
>;
const setupEslintPluginsMock = setupEslintPlugins as MockedFunction<
	typeof setupEslintPlugins
>;
const setupViteMock = setupVite as MockedFunction<typeof setupVite>;
const setupGitHooksMock = setupGitHooks as MockedFunction<typeof setupGitHooks>;
const setupStylelintMock = setupStylelint as MockedFunction<
	typeof setupStylelint
>;

vi.mock('../../src/scripts/init/setupTypescript', () => ({
	setupTypescript: vi.fn()
}));
vi.mock('../../src/scripts/utils/cwd', () => ({
	findCwd: vi.fn()
}));
vi.mock('../../src/scripts/files/PackageJson', async () => {
	const actual = await vi.importActual<object>(
		'../../src/scripts/files/PackageJson'
	);
	return {
		...actual,
		parsePackageJson: vi.fn()
	};
});
vi.mock('../../src/scripts/init/generateControlFile', () => ({
	generateControlFile: vi.fn()
}));

vi.mock('../../src/scripts/init/setupEslintFiles', () => ({
	setupEslintFiles: vi.fn()
}));

vi.mock('../../src/scripts/init/setupEslintPlugins', () => ({
	setupEslintPlugins: vi.fn()
}));
vi.mock('../../src/scripts/init/setupVite', () => ({
	setupVite: vi.fn()
}));
vi.mock('../../src/scripts/init/setupGitHooks', () => ({
	setupGitHooks: vi.fn()
}));
vi.mock('../../src/scripts/init/setupStylelint', () => ({
	setupStylelint: vi.fn()
}));
vi.mock('../../src/scripts/utils/terminate', () => ({
	terminate: vi.fn()
}));

describe('c-init', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('skips initialization if blank CWD found', async () => {
		findCwdMock.mockReturnValue(either.right(''));
		await execute(process);
		expect(setupTypescriptMock).not.toHaveBeenCalled();
		expect(terminate).toHaveBeenCalledWith('');
	});

	it('skips initialization if INIT_CWD equals cwd', async () => {
		const cwd = 'cwd';
		findCwdMock.mockReturnValue(either.right(cwd));
		const testProcess: NodeJS.Process = {
			...process,
			env: {
				...process.env,
				INIT_CWD: 'abc'
			}
		};
		await execute(testProcess);
		expect(setupTypescriptMock).not.toHaveBeenCalled();
		expect(terminate).toHaveBeenCalledWith('');
	});

	it('performs full initialization successfully', async () => {
		const packageJson: PackageJson = {
			name: '',
			version: '',
			type: 'module',
			dependencies: {},
			devDependencies: {}
		};
		const cwd = 'cwd';
		const plugins: ControlFile['eslintPlugins'] = {
			react: false,
			vitest: false,
			jestDom: false,
			tanstackQuery: false,
			cypress: false,
			testingLibraryReact: false
		};
		findCwdMock.mockReturnValue(either.right(cwd));
		setupTypescriptMock.mockReturnValue(either.right(func.constVoid()));
		generateControlFileMock.mockReturnValue(either.right(func.constVoid()));
		parsePackageJsonMock.mockReturnValue(either.right(packageJson));
		setupEslintFilesMock.mockReturnValue(
			taskEither.right(func.constVoid())
		);
		setupEslintPluginsMock.mockReturnValue(plugins);
		setupViteMock.mockReturnValue(either.right(func.constVoid()));
		setupGitHooksMock.mockReturnValue(either.right(func.constVoid()));
		setupStylelintMock.mockReturnValue(either.right(func.constVoid()));
		const testProcess: NodeJS.Process = {
			...process,
			env: {
				...process.env,
				INIT_CWD: cwd
			}
		};
		await execute(testProcess);
		expect(parsePackageJsonMock).toHaveBeenCalledWith(
			path.join(cwd, 'package.json')
		);
		expect(setupTypescriptMock).toHaveBeenCalledWith(cwd, 'module');
		expect(setupViteMock).toHaveBeenCalledWith(cwd, packageJson);
		expect(setupEslintPluginsMock).toHaveBeenCalled();
		expect(setupGitHooksMock).toHaveBeenCalledWith(cwd, testProcess);
		expect(setupStylelintMock).toHaveBeenCalledWith(cwd);
		expect(generateControlFileMock).toHaveBeenCalledWith(
			cwd,
			packageJson,
			plugins,
			false,
			false,
			testProcess
		);
		expect(terminate).toHaveBeenCalled();
	});

	it('handles initialization error', async () => {
		findCwdMock.mockReturnValue(either.left(new Error('Dying')));
		await execute(process);
		expect(setupTypescriptMock).not.toHaveBeenCalled();
		expect(terminate).toHaveBeenCalledWith(new Error('Dying'));
	});
});
