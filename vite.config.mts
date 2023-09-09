/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
	test: {
		setupFiles: ['./test/jest-fp-ts.ts', './test/setup.ts']
	}
});
