import { Type } from 'io-ts';
import { either, function as func } from 'fp-ts';
import { formatValidationErrors } from 'io-ts-reporters';

export const decode =
	<T>(typeCodec: Type<T>) =>
	(value: unknown) =>
		func.pipe(
			typeCodec.decode(value),
			either.mapLeft(formatValidationErrors),
			either.mapLeft((errors) => new Error(errors.join('; ')))
		);
