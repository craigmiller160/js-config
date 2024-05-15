/// <reference types="vitest" />
import { defineConfig } from './src/vite/vite.config.mjs';
import path from 'path';

export default defineConfig({
	test: {
		setupFiles: [path.join(process.cwd(), 'test', 'setup.ts')]
	}
});
