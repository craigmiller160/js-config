import { spawnSync, SpawnOptions } from 'child_process';
import { either } from 'fp-ts';


export const runCommandSync = (command: string, options?: SpawnOptions): either.Either<Error, string> => {
    const commandParts = command.split(' ');
    spawnSync(commandParts[0], commandParts.slice(1), options);
};