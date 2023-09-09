import { spawnSync, SpawnOptions } from 'child_process';
import { either } from 'fp-ts';
import { logger } from '../logger';

export const runCommandSync = (
	command: string,
	options?: SpawnOptions
): either.Either<Error, string> => {
	logger.debug(`Running command: ${command}`);
	const commandParts = command.split(' ');
	const result = spawnSync(commandParts[0], commandParts.slice(1), {
		...(options ?? {}),
		stdio: 'pipe'
	});
	const stdout = result.stdout?.toString('utf8') ?? '';
	const stderr = result.stderr?.toString('utf8');
	if (stdout) {
		logger.verbose(`  STDOUT: ${stdout}`);
	}
	if (stderr) {
		logger.error(`  STDERR: ${stderr}`);
	}

	if (result.status === 0) {
		return either.right(stdout);
	}

	return either.left(
		new Error(`Command failed. Status: ${result.status} Message: ${stderr}`)
	);
};
