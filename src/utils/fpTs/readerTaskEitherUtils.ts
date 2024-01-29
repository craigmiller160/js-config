import {
	readerTaskEither,
	readerEither,
	reader,
	function as func
} from 'fp-ts';

export const narrowAndChainFirstReaderK =
	<R1, R2, A, B>(
		narrow: (r: R1) => R2,
		chain: (a: A) => reader.Reader<R2, B>
	) =>
	<E>(
		rte: readerTaskEither.ReaderTaskEither<R1, E, A>
	): readerTaskEither.ReaderTaskEither<R1, E, A> =>
		func.pipe(
			rte,
			readerTaskEither.chainFirstReaderK((a) =>
				reader.local(narrow)(chain(a))
			)
		);

export const narrowAndChainFirstReaderEitherK =
	<R1, R2, E, A, B>(
		narrow: (r: R1) => R2,
		chain: (a: A) => readerEither.ReaderEither<R2, E, B>
	) =>
	(
		rte: readerTaskEither.ReaderTaskEither<R1, E, A>
	): readerTaskEither.ReaderTaskEither<R1, E, A> =>
		func.pipe(
			rte,
			readerTaskEither.chainFirstReaderEitherK((a) =>
				readerEither.local(narrow)(chain(a))
			)
		);
