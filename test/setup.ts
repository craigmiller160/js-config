import {vi} from 'vitest';

vi.mock('../scripts/utils/terminate', () => ({
    terminate: vi.fn()
}));