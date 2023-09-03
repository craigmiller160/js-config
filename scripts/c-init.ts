import {findCwd} from './utils/cwd';
import { function as func, either } from 'fp-ts';

const performInitialization = (process: NodeJS.Process) => (cwd: string) => {

};

export const execute = (process: NodeJS.Process) => {
    func.pipe(
        findCwd(process),
        either.fold(
            (error) => {
                throw error
            },
            performInitialization(process)
        )
    );
};