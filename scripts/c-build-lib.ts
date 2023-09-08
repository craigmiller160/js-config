import path from 'path';
import fs from 'fs';
import { logger } from './logger';
import { runCommandSync } from './utils/runCommand';
import { function as func, either } from 'fp-ts';
import { terminate } from './utils/terminate';
import { findCommand } from './utils/command';
import { SWC, TSC } from './commandPaths';

export const execute = (process: NodeJS.Process) => {
	logger.info('Performing library build');
	const srcDir = path.join(process.cwd(), 'src');
	const libDir = path.join(process.cwd(), 'lib');
	if (fs.existsSync(libDir)) {
		fs.rmSync(libDir, {
			recursive: true,
			force: true
		});
	}

	const esModuleDir = path.join(libDir, 'esm');
	const commonjsDir = path.join(libDir, 'cjs');
	const typesDir = path.join(libDir, 'types');
	const configPath = path.join(__dirname, '..', 'configs', 'swc', '.swcrc');

	func.pipe(
		findCommand(process, SWC),
		either.bindTo('swcCommand'),
		either.bind('tscCommand', () => findCommand(process, TSC)),
		either.chainFirst(({ swcCommand }) =>
			runCommandSync(
				`${swcCommand} ${srcDir} -d ${esModuleDir} --config-file ${configPath} -C module.type=es6`
			)
		),
		either.chainFirst(({ swcCommand }) =>
			runCommandSync(
				`${swcCommand} ${srcDir} -d ${commonjsDir} --config-file ${configPath} -C module.type=commonjs`
			)
		),
		either.chainFirst(({ tscCommand }) =>
			runCommandSync(
				`${tscCommand} --declaration --emitDeclarationOnly --outDir ${typesDir}`
			)
		),
		either.fold(terminate, terminate)
	);
};
