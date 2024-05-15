import { spawnSync, SpawnOptions, spawn } from 'child_process';
import { either, taskEither } from 'fp-ts';
import { logger } from '../logger';

export const runCommandAsync = (
    command: string,
    options?: Partial<SpawnOptions>
): taskEither.TaskEither<Error, string> => {
    logger.debug(`Running command: ${command}`);

    return taskEither.tryCatch(
        () =>
            new Promise((resolve, reject) => {
                const commandParts = command.split(' ');
                const childProcess = spawn(
                    commandParts[0],
                    commandParts.slice(1),
                    {
                        ...(options ?? {}),
                        stdio: options?.stdio ?? 'inherit'
                    }
                );

                let output = '';
                let error = '';

                childProcess.stdout?.on('data', (data: Buffer) => {
                    const text = data.toString('utf8');
                    output += `${text}\n`;
                });

                childProcess.stderr?.on('data', (data: Buffer) => {
                    const text = data.toString('utf8');
                    error += `${text}\n`;
                });

                childProcess.on('exit', (code) => {
                    if (code === 0) {
                        resolve(output.trim());
                    } else {
                        reject(
                            new Error(
                                `Command failed. Status: ${code} Message: ${error.trim()}`
                            )
                        );
                    }
                });
            }),
        either.toError
    );
};

export const runCommandSync = (
    command: string,
    options?: Partial<SpawnOptions>
): either.Either<Error, string> => {
    logger.debug(`Running command: ${command}`);
    const commandParts = command.split(' ');
    const result = spawnSync(commandParts[0], commandParts.slice(1), {
        ...(options ?? {}),
        stdio: options?.stdio ?? 'inherit'
    });
    const stdout = result.stdout?.toString('utf8') ?? '';
    const stderr = result.stderr?.toString('utf8') ?? '';

    if (result.status === 0) {
        return either.right(stdout);
    }

    return either.left(
        new Error(`Command failed. Status: ${result.status} Message: ${stderr}`)
    );
};

export type RunCommandSync = typeof runCommandSync;
