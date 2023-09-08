import { either, function as func } from 'fp-ts';

export const isLibraryPresent = (name: string): boolean =>
	func.pipe(
		either.tryCatch(() => require.resolve(name), func.identity),
		either.isRight
	);
