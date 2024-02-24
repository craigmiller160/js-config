import { logger } from './logger';
import { either, function as func } from 'fp-ts';
import { runCommandSync } from './utils/runCommand';
import { terminate } from './utils/terminate';
import { parseControlFile } from './files/ControlFile';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running full validation');

	parseControlFile(process);

	func.pipe(
		parseControlFile(process),
		either.bindTo('controlFile'),
		either.chainFirst(() => runCommandSync('c-type-check')),
		either.chainFirst(() => runCommandSync('c-eslint')),
		either.chainFirst(() => runCommandSync('c-stylelint')),
		either.chainFirst(
			({
				controlFile: {
					directories: { test }
				}
			}) => {
				if (test) {
					return runCommandSync('c-test');
				}
				return either.right('');
			}
		),
		either.chainFirst(
			({
				controlFile: {
					directories: { cypress }
				}
			}) => {
				if (cypress) {
					return runCommandSync('c-cypress');
				}
				return either.right('');
			}
		),
		either.fold(terminate, terminate)
	);
};
