import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		setupFiles: ['./test/jest-fp-ts.ts', './test/setup.ts']
	}
});
