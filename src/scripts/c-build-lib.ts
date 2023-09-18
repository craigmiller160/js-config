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
	const configRoot = path.join(__dirname, '..', '..', 'configs', 'swc');
	const jsConfigPath = path.join(configRoot, '.swcrc_js');
	const tsConfigPath = path.join(configRoot, '.swcrc_ts');

	func.pipe(
		findCommand(process, SWC),
		either.bindTo('swcCommand'),
		either.bind('tscCommand', () => findCommand(process, TSC)),
		either.chainFirst(({ swcCommand }) =>
			runCommandSync(
				`${swcCommand} ${srcDir} -d ${esModuleDir} --config-file ${jsConfigPath} -C module.type=es6 --only **/*.{js,mjs,cjs,jsx}`
			)
		),
		either.chainFirst(({ swcCommand }) =>
			runCommandSync(
				`${swcCommand} ${srcDir} -d ${esModuleDir} --config-file ${tsConfigPath} -C module.type=es6 --only **/*.{ts,mts,cts,tsx}`
			)
		),
		either.chainFirst(({ swcCommand }) =>
			runCommandSync(
				`${swcCommand} ${srcDir} -d ${commonjsDir} --config-file ${jsConfigPath} -C module.type=commonjs --only **/*.{js,mjs,cjs,jsx}`
			)
		),
		either.chainFirst(({ swcCommand }) =>
			runCommandSync(
				`${swcCommand} ${srcDir} -d ${commonjsDir} --config-file ${tsConfigPath} -C module.type=commonjs --only **/*.{ts,mts,cts,tsx}`
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
