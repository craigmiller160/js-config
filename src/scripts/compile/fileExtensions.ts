import path from 'path';
import { match, P } from 'ts-pattern';
import { function as func, readonlyArray, taskEither, either } from 'fp-ts';
import { logger } from '../logger';
import { walk } from '../utils/files';
import fs from 'fs/promises';

const EXTENSION = /\.[^/.]+$/;

export const fixFileExtension = (filePath: string): string => {
    const filePathWithoutExtension = filePath.replace(EXTENSION, '');
    if (
        filePath.endsWith('.d.ts') ||
        filePath.endsWith('.d.mts') ||
        filePath.endsWith('.d.cts')
    ) {
        return `${filePathWithoutExtension}.ts`;
    }
    const originalExtension = path.extname(filePath);
    const newExtension = match(originalExtension)
        .with(
            P.union(
                '.ts',
                '.mts',
                '.cts',
                '.js',
                '.cjs',
                '.mjs',
                '.tsx',
                '.jsx'
            ),
            () => '.js'
        )
        .otherwise(() => originalExtension);
    return `${filePathWithoutExtension}${newExtension}`;
};

export const fixTypeFileExtensions = (
    typesDir: string
): taskEither.TaskEither<Error, unknown> => {
    logger.debug('Fixing type declaration file extensions');
    return func.pipe(
        taskEither.tryCatch(() => walk(typesDir), either.toError),
        taskEither.map((files) =>
            files.filter(
                (file) => file.endsWith('.mts') || file.endsWith('.cts')
            )
        ),
        taskEither.chain(
            func.flow(
                readonlyArray.map((file) => {
                    const newFile = `${file.replace(EXTENSION, '')}.ts`;
                    return taskEither.tryCatch(
                        () => fs.rename(file, newFile),
                        either.toError
                    );
                }),
                taskEither.sequenceArray
            )
        )
    );
};
