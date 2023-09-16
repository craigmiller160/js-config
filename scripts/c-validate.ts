import { logger } from './logger';
import { either, function as func } from 'fp-ts';
import { runCommandSync } from './utils/runCommand';
import { terminate } from './utils/terminate';
import { findCwd } from './utils/cwd';
import path from 'path';
import fs from 'fs';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running full validation');
	func.pipe(
		findCwd(process),
		either.bindTo('cwd'),
		either.chainFirst(() => runCommandSync('c-type-check')),
		either.chainFirst(() => runCommandSync('c-eslint')),
		either.chainFirst(() => runCommandSync('c-stylelint')),
		either.chainFirst(() => runCommandSync('c-test')),
		either.chainFirst(({ cwd }) => {
			const cypressPath = path.join(cwd, 'cypress');
			if (fs.existsSync(cypressPath)) {
				return runCommandSync('c-cypress');
			}
			return either.right('');
		}),
		either.fold(terminate, terminate)
	);
};
