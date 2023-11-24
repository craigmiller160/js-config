import { logger } from './logger';
import { function as func, taskEither } from 'fp-ts';
import { findCommand } from './utils/command';
import { CYPRESS } from './commandPaths';
import { runCommandSync } from './utils/runCommand';
import { terminate } from './utils/terminate';
import { compileAndGetCypressConfig } from './cypress';

export const execute = (process: NodeJS.Process): Promise<void> => {
	logger.info('Running all cypress tests');
	return func.pipe(
		findCommand(process, CYPRESS),
		taskEither.fromEither,
		taskEither.bindTo('command'),
		taskEither.bind('config', () => compileAndGetCypressConfig(process)),
		taskEither.chainEitherK(({ command, config }) =>
			runCommandSync(
				`${command} run --component -b electron -C ${config}`
			)
		),
		taskEither.fold(
			(ex) => () => {
				terminate(ex);
				return Promise.resolve();
			},
			() => () => {
				terminate('');
				return Promise.resolve();
			}
		)
	)();
};
