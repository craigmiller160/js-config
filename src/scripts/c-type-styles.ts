import {
	RunCommandSync,
	runCommandSync as defaultRunCommandSync
} from './utils/runCommand';
import { logger } from './logger';
import { function as func, either } from 'fp-ts';
import { findCommand } from './utils/command';
import { TYPED_CSS_MODULES, TYPED_SCSS_MODULES } from './commandPaths';
import { terminate } from './utils/terminate';
import path from 'path';

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

	const basePathPattern = path.join(process.cwd(), 'src', '**');
	const cssPathPattern = path.join(basePathPattern, '*.module.css');
	const scssPathPattern = path.join(basePathPattern, '*.module.scss');

	const runTypeCssModules = () =>
		func.pipe(
			findCommand(process, TYPED_CSS_MODULES),
			either.chain((cmd) =>
				runCommandSync(`${cmd} -p '${cssPathPattern}'`)
			)
		);
	const runTypeScssModules = () =>
		func.pipe(
			findCommand(process, TYPED_SCSS_MODULES),
			either.chain((cmd) => runCommandSync(`${cmd} '${scssPathPattern}'`))
		);

	func.pipe(
		runTypeCssModules(),
		either.chain(() => runTypeScssModules()),
		either.fold(terminate, terminate)
	);
};
