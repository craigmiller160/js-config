import { runCommandSync } from './utils/runCommand';
import { either, function as func } from 'fp-ts';
import { terminate } from './utils/terminate';
import { findCommand } from './utils/command';
import { VITEST } from './commandPaths';

export const execute = (process: NodeJS.Process) =>
	func.pipe(
		findCommand(process, VITEST),
		either.chain((command) => runCommandSync(`${command} run`)),
		either.fold(terminate, terminate)
	);
