import { vi } from 'vitest';
import path from 'path';
vi.mock('../src/scripts/utils/runCommand', () => ({
	runCommandSync: vi.fn(),
	runCommandAsync: vi.fn()
}));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.env.NODE_PATH = path.join(process.cwd(), 'node_modules');
