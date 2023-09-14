import { describe, it, MockedFunction, expect, beforeEach, vi } from 'vitest';
import { execute } from '../../scripts/c-build-lib';
import { runCommandSync } from '../../scripts/utils/runCommand';
import path from 'path';
import { either } from 'fp-ts';
import { SWC, TSC } from '../../scripts/commandPaths';

const runCommandSyncMock = runCommandSync as MockedFunction<
	typeof runCommandSync
>;
const srcDir = path.join(process.cwd(), 'src');
const libDir = path.join(process.cwd(), 'lib');
const esModuleDir = path.join(libDir, 'esm');
const commonjsDir = path.join(libDir, 'cjs');
const typesDir = path.join(libDir, 'types');
const configPath = path.join(process.cwd(), 'configs', 'swc', '.swcrc');

const swcCommand = path.join(process.cwd(), 'node_modules', SWC);
const tscCommand = path.join(process.cwd(), 'node_modules', TSC);

describe('c-build-lib', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});
	it('runs build', () => {
		runCommandSyncMock.mockReturnValue(either.right(''));
		execute(process);
		expect(runCommandSyncMock).toHaveBeenCalledTimes(3);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			1,
			`${swcCommand} ${srcDir} -d ${esModuleDir} --config-file ${configPath} -C module.type=es6`
		);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			2,
			`${swcCommand} ${srcDir} -d ${commonjsDir} --config-file ${configPath} -C module.type=commonjs`
		);
		expect(runCommandSyncMock).toHaveBeenNthCalledWith(
			3,
			`${tscCommand} --declaration --emitDeclarationOnly --outDir ${typesDir}`
		);
	});
});
