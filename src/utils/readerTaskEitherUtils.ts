import { readerTaskEither, reader, function as func } from 'fp-ts';

export const narrowAndChainFirstReaderK =
	<R1, R2, A, B>(f1: (r: R1) => R2, f2: (a: A) => reader.Reader<R2, B>) =>
	<E>(
		rte: readerTaskEither.ReaderTaskEither<R1, E, A>
	): readerTaskEither.ReaderTaskEither<R1, E, A> =>
		func.pipe(
			rte,
			readerTaskEither.chainFirstReaderK((a) => reader.local(f1)(f2(a)))
		);
