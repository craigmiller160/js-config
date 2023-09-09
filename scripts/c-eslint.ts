import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { getRealArgs } from './utils/process';

const DEFAULT_PATH = '{src,test,cypress}/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}';

export const execute = (process: NodeJS.Process) => {
	const args = getRealArgs(process);
	const lintPath = args.length > 0 ? args[0] : DEFAULT_PATH;
	func.pipe(
		runCommandSync(`eslint --fix --max-warnings=0 ${lintPath}`),
		either.fold(terminate, terminate)
	);
};
