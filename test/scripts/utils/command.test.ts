import { describe, it, expect } from 'vitest';
import path from 'path';
import { findCommand } from '../../../src/scripts/utils/command';

const WORKING_DIR = path.join(
	process.cwd(),
	'test',
	'__working_directories__',
	'command'
);

const NODE_PATH: string = [
	'.pnpm/js-config-root@1.0.0/node_modules/@craigmiller160/js-config/build/bin/node_modules',
	'.pnpm/js-config-root@1.0.0/node_modules/@craigmiller160/js-config/build/node_modules',
	'.pnpm/js-config-root@1.0.0/node_modules/@craigmiller160/js-config/node_modules',
	'.pnpm/js-config-root@1.0.0/node_modules/@craigmiller160/node_modules',
	'.pnpm/js-config-root@1.0.0/node_modules',
	'.pnpm/node_modules'
]
	.map((thePath) => path.join(WORKING_DIR, 'node_modules', thePath))
	.join(':');

describe('command', () => {
	describe('findCommand', () => {
		it('finds command from NODE_PATH', () => {
			const result = findCommand(
				{
					...process,
					env: {
						...process.env,
						NODE_PATH
					}
				},
				'typescript/bin/tsc'
			);
			expect(result).toEqualRight(
				path.join(NODE_PATH.split(':')[3], 'typescript/bin/tsc')
			);
		});

		it.fails('finds command from alternative pnpm path', () => {
			const result = findCommand(
				{
					...process,
					env: {
						...process.env,
						NODE_PATH: undefined
					}
				},
				'typescript/bin/tsc'
			);
			expect(result).toEqualRight(
				path.join(
					WORKING_DIR,
					'node_modules',
					'.pnpm',
					'typescript@5.2.0',
					'node_modules',
					'typescript/bin/tsc'
				)
			);
		});

		it('cannot find command', () => {
			const result = findCommand(
				{
					...process,
					env: {
						...process.env,
						NODE_PATH
					}
				},
				'foo/bar'
			);
			expect(result).toEqualLeft(
				new Error('Unable to find command: foo/bar')
			);
		});
	});
});
