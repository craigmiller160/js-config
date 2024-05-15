import fs from 'fs/promises';
import path from 'path';

const isDirectory = async (filePath: string): Promise<boolean> => {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
};

export const walk = async (
    filePath: string
): Promise<ReadonlyArray<string>> => {
    const filePathIsDirectory = await isDirectory(filePath);
    if (!filePathIsDirectory) {
        return [filePath];
    }

    const files = await fs.readdir(filePath);
    const promises = files.map((file) => walk(path.join(filePath, file)));
    const walkResults = await Promise.all(promises);
    return walkResults.flat();
};
