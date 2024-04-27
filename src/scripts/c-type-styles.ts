import { runCommandSync as defaultRunCommandSync } from './utils/runCommand';

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
) => {};
