export const unknownToError = (theUnknown: unknown): Error => {
	if (theUnknown instanceof Error) {
		return theUnknown;
	}
	// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
	return new Error(`Unknown error: ${theUnknown}`);
};
