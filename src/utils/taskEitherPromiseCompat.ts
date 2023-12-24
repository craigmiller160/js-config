import { taskEither } from 'fp-ts';
import type { TaskEither } from 'fp-ts/TaskEither';
import type { Task } from 'fp-ts/Task';

export const taskEitherToPromiseCompatTask = <R>(te: TaskEither<Error, R>): Task<R> =>
	taskEither.fold<Error, R, R>(
		(e) => () => Promise.reject(e),
		(r) => () => Promise.resolve(r)
	)(te);
