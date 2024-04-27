import { runCommandSync as defaultRunCommandSync } from './utils/runCommand';
import { logger } from './logger';
import { function as func, either } from 'fp-ts';
import { findCommand } from './utils/command';
import { TYPED_CSS_MODULES, TYPED_SCSS_MODULES } from './commandPaths';
import { terminate } from './utils/terminate';

type RunCommandSync = typeof defaultRunCommandSync;
export type Dependencies = Readonly<{
	process: NodeJS.Process;
	runCommandSync: RunCommandSync;
}>;

export const execute = (
	dependencies: Dependencies = {
		process,
		runCommandSync: defaultRunCommandSync
	}
) => {
	const { process, runCommandSync } = dependencies;
	logger.info('Generating types for CSS/SCSS modules');

	const runTypeCssModules = () =>
		func.pipe(
			findCommand(process, TYPED_CSS_MODULES),
			either.chain((cmd) =>
				runCommandSync(`${cmd} -p 'src/**/*.module.css'`)
			)
		);
	const runTypeScssModules = () =>
		func.pipe(
			findCommand(process, TYPED_SCSS_MODULES),
			either.chain((cmd) => runCommandSync(`${cmd} 'src/**/*.scss'`))
		);

	func.pipe(
		runTypeCssModules(),
		either.chain(() => runTypeScssModules()),
		either.fold(terminate, terminate)
	);
};
