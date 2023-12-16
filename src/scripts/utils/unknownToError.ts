export const unknownToError = (theUnknown: unknown): Error => {
	if (theUnknown instanceof Error) {
		return theUnknown;
	}
	 
	return new Error(`Unknown error: ${theUnknown}`);
};
