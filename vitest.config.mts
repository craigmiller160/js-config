import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        setupFiles: [
            '@relmify/jest-fp-ts'
        ]
    }
})