import { either, function as func } from 'fp-ts';
import { logger } from '../logger';

export const isLibraryPresent = (name: string): boolean =>
	func.pipe(
		either.tryCatch(() => require.resolve(name), func.identity),
		either.mapLeft((ex) => {
			logger.error(`EXCEPTION: ${ex}`); // TODO delete this
			return ex;
		}),
		either.isRight
	);

export type IsLibraryPresent = typeof isLibraryPresent;
