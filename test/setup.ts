import { vi } from 'vitest';
import path from 'path';
import '../configs/test-support/jest-fp-ts.mjs';

vi.mock('../src/scripts/utils/runCommand', () => ({
	runCommandSync: vi.fn(),
	runCommandAsync: vi.fn()
}));

process.env.NODE_PATH = path.join(process.cwd(), 'node_modules');
