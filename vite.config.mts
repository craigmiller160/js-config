/// <reference types="vitest" />
import { defineConfig } from './configs/vite/vite.config.mjs';
import path from 'path';

export default defineConfig({
    test: {
        setupFiles: [path.join(process.cwd(), 'test', 'setup.ts')]
    }
});
