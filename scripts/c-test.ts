import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';

export const execute = () =>
	func.pipe(runCommandSync('vitest run'), either.fold(terminate, terminate));
