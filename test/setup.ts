import {vi} from 'vitest';
import path from 'path';
vi.mock('../scripts/utils/runCommand', () => ({
    runCommandSync: vi.fn()
}));

vi.mock('../scripts/utils/terminate', () => ({
    terminate: vi.fn()
}));

// @ts-ignore
process.env.NODE_PATH = path.join(process.cwd(), 'node_modules');