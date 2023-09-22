import { describe, it, MockedFunction, expect, beforeEach, vi } from 'vitest';
import { execute } from '../../src/scripts/c-build-lib';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import path from 'path';
import { either } from 'fp-ts';
import { SWC, TSC } from '../../src/scripts/commandPaths';
import fs from 'fs';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories',
	'buildLib'
);
const srcDir = path.join(WORKING_DIR, 'src');
const libDir = path.join(WORKING_DIR, 'lib');
const esModuleDir = path.join(libDir, 'esm');
const commonjsDir = path.join(libDir, 'cjs');
const typesDir = path.join(libDir, 'types');

const tscCommand = path.join(process.cwd(), 'node_modules', TSC);

vi.unmock('../../src/scripts/utils/runCommand');

describe('c-build-lib', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		fs.rmSync(libDir, {
			recursive: true,
			force: true
		});
	});

	it.fails('performs the entire library build for both esm and cjs');

	it.fails('performs the entire library build for just esm');

	it.fails('performs the entire library build for just cjs');
});
