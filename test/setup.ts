import {vi} from 'vitest';
vi.mock('../scripts/utils/runCommand', () => ({
    runCommandSync: vi.fn()
}));

vi.mock('../scripts/utils/terminate', () => ({
    terminate: vi.fn()
}));