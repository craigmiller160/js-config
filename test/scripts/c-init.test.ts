import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { setupTypescript } from '../../scripts/init/setupTypescript';
import { findCwd } from '../../scripts/utils/cwd';
import { terminate } from '../../scripts/utils/terminate';
import { either, function as func } from 'fp-ts';
import { execute } from '../../scripts/c-init';
import { PackageJson, parsePackageJson } from '../../scripts/files/PackageJson';
import path from 'path';
import { generateControlFile } from '../../scripts/init/generateControlFile';

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

vi.mock('../../scripts/init/setupTypescript', () => ({
	setupTypescript: vi.fn()
}));
vi.mock('../../scripts/utils/cwd', () => ({
	findCwd: vi.fn()
}));
vi.mock('../../scripts/files/PackageJson', () => ({
	parsePackageJson: vi.fn()
}));
vi.mock('../../scripts/init/generateControlFile', () => ({
	generateControlFile: vi.fn()
}));

describe('c-init', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('skips initialization if blank CWD found', () => {
		findCwdMock.mockReturnValue(either.right(''));
		execute(process);
		expect(setupTypescriptMock).not.toHaveBeenCalled();
		expect(terminate).toHaveBeenCalledWith(undefined);
	});

	it('performs full initialization successfully', () => {
		const packageJson: PackageJson = {
			name: '',
			version: '',
			type: undefined,
			dependencies: {},
			devDependencies: {}
		};
		const cwd = 'cwd';
		findCwdMock.mockReturnValue(either.right(cwd));
		setupTypescriptMock.mockReturnValue(either.right(func.constVoid()));
		generateControlFileMock.mockReturnValue(either.right(func.constVoid()));
		parsePackageJsonMock.mockReturnValue(either.right(packageJson));
		execute(process);
		expect(parsePackageJsonMock).toHaveBeenCalledWith(
			path.join(cwd, 'package.json')
		);
		expect(setupTypescriptMock).toHaveBeenCalledWith(cwd);
		expect(generateControlFileMock).toHaveBeenCalledWith(
			cwd,
			packageJson,
			process
		);
		expect(terminate).toHaveBeenCalled();
	});

	it('handles initialization error', () => {
		findCwdMock.mockReturnValue(either.left(new Error('Dying')));
		execute(process);
		expect(setupTypescriptMock).not.toHaveBeenCalled();
		expect(terminate).toHaveBeenCalledWith(new Error('Dying'));
	});
});
