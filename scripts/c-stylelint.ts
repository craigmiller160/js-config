import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { logger } from './logger';
import { findCommand } from './utils/command';
import { STYLELINT } from './commandPaths';
import path from 'path';

const CONFIG = path.join(
	__dirname,
	'..',
	'configs',
	'stylelint',
	'.stylelintrc.json'
);

export const execute = (process: NodeJS.Process) => {
	logger.info('Running stylelint');
	func.pipe(
		findCommand(process, STYLELINT),
		either.chain((command) =>
			runCommandSync(`${command} -c ${CONFIG} src/**/*.{css,scss}`)
		),
		either.fold(terminate, terminate)
	);
};
