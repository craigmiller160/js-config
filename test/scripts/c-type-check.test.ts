import { beforeEach, expect, MockedFunction, test, vi } from 'vitest';
import path from 'path';
import { execute } from '../../src/scripts/c-type-check';
import { either } from 'fp-ts';
import { runCommandSync } from '../../src/scripts/utils/runCommand';
import {
    ControlFile,
    parseControlFile
} from '../../src/scripts/files/ControlFile';
import fs from 'fs/promises';

const WORKING_DIR = path.join(
    process.cwd(),
    'test',
    '__working_directories__',
    'typeCheck'
);
const CONTROL_FILE = path.join(WORKING_DIR, '.js-config.json');
const TSC = path.join(
    process.cwd(),
    'node_modules',
    'typescript',
    'bin',
    'tsc'
);

const runCommandSyncMock: MockedFunction<typeof runCommandSync> = vi.fn();
const parseControlFileMock: MockedFunction<typeof parseControlFile> = vi.fn();

type TypeCheckAdditionalDirectory = 'test' | 'cypress';
type TypeCheckTestParams = Readonly<{
    additionalDirectories: ReadonlyArray<TypeCheckAdditionalDirectory>;
}>;

const exists = (filePath: string): Promise<boolean> =>
    fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);

const deleteControlFile = async () => {
    const controlFileExists = await exists(CONTROL_FILE);
    if (controlFileExists) {
        await fs.rm(CONTROL_FILE);
    }
};

beforeEach(async () => {
    await deleteControlFile();
    vi.resetAllMocks();
    runCommandSyncMock.mockReturnValue(either.right(''));
});

test.each<TypeCheckTestParams>([
    { additionalDirectories: [] },
    { additionalDirectories: ['test'] },
    { additionalDirectories: ['cypress'] },
    { additionalDirectories: ['test', 'cypress'] }
])(
    'c-type-check with additional directories $additionalDirectories',
    async ({ additionalDirectories }) => {
        const controlFile: ControlFile = {
            workingDirectoryPath: '',
            projectType: 'module',
            eslintPlugins: {
                cypress: false,
                testingLibraryReact: false,
                tanstackQuery: false,
                jestDom: false,
                vitest: false,
                react: false
            },
            directories: {
                test: additionalDirectories.includes('test'),
                cypress: additionalDirectories.includes('cypress')
            }
        };
        await fs.writeFile(CONTROL_FILE, JSON.stringify(controlFile));
        parseControlFileMock.mockReturnValue(either.right(controlFile));
        execute({
            process: {
                ...process,
                cwd: () => WORKING_DIR
            },
            runCommandSync: runCommandSyncMock
        });

        const numberOfCalls = additionalDirectories.includes('cypress') ? 2 : 1;
        expect(runCommandSyncMock).toHaveBeenCalledTimes(numberOfCalls);

        const firstTsConfigPath = additionalDirectories.includes('test')
            ? path.join(WORKING_DIR, 'test', 'tsconfig.json')
            : path.join(WORKING_DIR, 'tsconfig.json');
        expect(runCommandSyncMock).toHaveBeenNthCalledWith(
            1,
            `${TSC} --noEmit --project ${firstTsConfigPath}`
        );

        if (additionalDirectories.includes('cypress')) {
            const cypressTsConfigPath = path.join(
                WORKING_DIR,
                'cypress',
                'tsconfig.json'
            );
            expect(runCommandSyncMock).toHaveBeenNthCalledWith(
                2,
                `${TSC} --noEmit --project ${cypressTsConfigPath}`
            );
        }
    }
);
