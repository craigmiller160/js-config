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
		stdio: options?.stdio ?? 'inherit'
	});
	if (result.status === 0) {
		return either.right(result.stdout?.toString('utf8') ?? '');
	}
	return either.left(
		new Error(
			`Command failed. Status: ${result.status} Message: ${
				result.stderr?.toString('utf8') ?? ''
			}`
		)
	);
};
