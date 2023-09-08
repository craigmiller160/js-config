import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';

export const execute = () =>
	func.pipe(
		runCommandSync(
			'eslint --fix --max-warnings=0 {src,test,cypress}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'
		),
		either.fold(terminate, terminate)
	);
