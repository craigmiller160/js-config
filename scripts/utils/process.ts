export const getRealArgs = (process: NodeJS.Process): ReadonlyArray<string> =>
	process.argv.slice(2);
