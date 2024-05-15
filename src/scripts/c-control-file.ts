import { either, function as func } from 'fp-ts';
import { parseControlFile } from './files/ControlFile';
import { terminate } from './utils/terminate';

export const execute = (process: NodeJS.Process) =>
    func.pipe(
        parseControlFile(process),
        either.map((file) => {
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(file, null, 2));
            return file;
        }),
        either.fold(terminate, terminate)
    );
