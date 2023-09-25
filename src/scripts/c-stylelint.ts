import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { logger } from './logger';
import { findCommand } from './utils/command';
import { STYLELINT } from './commandPaths';
import { getRealArgs } from './utils/process';

const DEFAULT_PATH = 'src/**/*.{css,scss}';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running stylelint');
	const args = getRealArgs(process);
	const lintPath = args.length > 0 ? args[0] : DEFAULT_PATH;
	func.pipe(
		findCommand(process, STYLELINT),
		either.chain((command) =>
			runCommandSync(
				`${command} --fix --max-warnings=0 --allow-empty-input ${lintPath}`
			)
		),
		either.fold(terminate, terminate)
	);
};
