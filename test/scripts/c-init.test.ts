import {describe, it, expect, beforeEach, vi, MockedFunction, Mock} from 'vitest';
import {setupTypescript} from '../../scripts/init/setupTypescript';
import {findCwd} from '../../scripts/utils/cwd';
import {terminate} from '../../scripts/utils/terminate';
import { either, function as func } from 'fp-ts';
import {execute} from '../../scripts/c-init';
import { parsePackageJson } from '../../scripts/utils/PackageJson';

const findCwdMock = findCwd as MockedFunction<typeof findCwd>;
const setupTypescriptMock = setupTypescript as MockedFunction<typeof setupTypescript>;
const terminateMock = terminate as MockedFunction<typeof terminate>;
const parsePackageJsonMock = parsePackageJson as MockedFunction<typeof parsePackageJson>;

vi.mock('../../scripts/init/setupTypescript', () => ({
    setupTypescript: vi.fn()
}));
vi.mock('../../scripts/utils/cwd', () => ({
    findCwd: vi.fn()
}));
vi.mock('../../scripts/utils/PackageJson', () => ({
    parsePackageJson: vi.fn()
}));

describe('c-init', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('skips initialization if blank CWD found', () => {
        findCwdMock.mockReturnValue(either.right(''));
        execute(process);
        expect(setupTypescriptMock).not.toHaveBeenCalled();
        expect(terminate).toHaveBeenCalledWith(undefined);
    });

    it('performs full initialization successfully', () => {
        const cwd = 'cwd';
        findCwdMock.mockReturnValue(either.right(cwd));
        setupTypescriptMock.mockReturnValue(either.right(func.constVoid()));
        parsePackageJsonMock.mockReturnValue(either.right({
            name: '',
            version: '',
            dependencies: {},
            devDependencies: {}
        }));
        execute(process);
        expect(setupTypescriptMock).toHaveBeenCalledWith(cwd);
        expect(terminate).toHaveBeenCalledWith(undefined);
    });

    it('handles initialization error', () => {
        findCwdMock.mockReturnValue(either.left(new Error('Dying')));
        execute(process);
        expect(setupTypescriptMock).not.toHaveBeenCalled();
        expect(terminate).toHaveBeenCalledWith(new Error('Dying'));
    });
})

