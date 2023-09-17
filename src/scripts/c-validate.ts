import { logger } from './logger';
import { either, function as func } from 'fp-ts';
import { runCommandSync } from './utils/runCommand';
import { terminate } from './utils/terminate';
import path from 'path';
import fs from 'fs';

export const execute = (process: NodeJS.Process) => {
	logger.info('Running full validation');
	func.pipe(
		runCommandSync('c-type-check'),
		either.chain(() => runCommandSync('c-eslint')),
		either.chain(() => runCommandSync('c-stylelint')),
		either.chain(() => runCommandSync('c-test')),
		either.chain(() => {
			const cypressPath = path.join(process.cwd(), 'cypress');
			if (fs.existsSync(cypressPath)) {
				return runCommandSync('c-cypress');
			}
			return either.right('');
		}),
		either.fold(terminate, terminate)
	);
};
