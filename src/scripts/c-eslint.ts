import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import path from 'path';
import fs from 'fs';
import { terminate } from './utils/terminate';
import { getRealArgs } from './utils/process';
import { findCommand } from './utils/command';
import { ESLINT } from './commandPaths';
import { logger } from './logger';

const SRC_TEST_PATH = '{src,test}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';
const CYPRESS_PATH = 'cypress/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running eslint');
	const args = getRealArgs(process);

	const eslintEither = findCommand(process, ESLINT);
	const cypressDir = path.join(process.cwd(), 'cypress');

	if (args.length > 0) {
		func.pipe(
			eslintEither,
			either.chain((command) =>
				runCommandSync(`${command} --fix --max-warnings=0 ${args[0]}`)
			),
			either.fold(terminate, terminate)
		);
		return;
	}

	func.pipe(
		eslintEither,
		either.chain((command) =>
			runCommandSync(`${command} --fix --max-warnings=0 ${SRC_TEST_PATH}`)
		),
		either.chain((command) => {
			if (fs.existsSync(cypressDir)) {
				return runCommandSync(
					`${command} --fix --max-warnings=0 ${CYPRESS_PATH}`,
					{
						env: {
							...process.env,
							NO_VITEST: 'true'
						}
					}
				);
			}
			return either.right('');
		}),
		either.fold(terminate, terminate)
	);
};
