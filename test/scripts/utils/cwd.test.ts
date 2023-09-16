import { describe, it, expect } from 'vitest';
import { findCwd } from '../../../src/scripts/utils/cwd';
import path from 'path';

const WORKING_DIR_ROOT = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'env'
);

const newProcess = (cwd: string): NodeJS.Process => ({
	...process,
	cwd: () => cwd
});

describe('cwd', () => {
	describe('findCwd', () => {
		it('is js-config library itself', () => {
			const cwd = path.join(WORKING_DIR_ROOT, 'js-config');
			const result = findCwd(newProcess(cwd));
			expect(result).toEqualRight('');
		});

		it('is added directly to project', () => {
			const cwd = path.join(
				WORKING_DIR_ROOT,
				'direct-to-project',
				'node_modules',
				'@craigmiller160',
				'js-config'
			);
			const result = findCwd(newProcess(cwd));
			expect(result).toEqualRight(
				path.join(WORKING_DIR_ROOT, 'direct-to-project')
			);
		});

		it('is added directly to project via pnpm', () => {
			const cwd = path.join(
				WORKING_DIR_ROOT,
				'pnpm-to-project',
				'node_modules',
				'.pnpm',
				'@craigmiller160+js-config'
			);
			const result = findCwd(newProcess(cwd));
			expect(result).toEqualRight(
				path.join(WORKING_DIR_ROOT, 'pnpm-to-project')
			);
		});

		it('is invalid', () => {
			const result = findCwd(newProcess(WORKING_DIR_ROOT));
			expect(result).toEqualLeft(
				new Error(
					`Error finding matching path for starting CWD: ${WORKING_DIR_ROOT}`
				)
			);
		});
	});
});
