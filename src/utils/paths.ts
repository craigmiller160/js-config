import path from 'path';
export const getTestDirectoryPath = (cwd: string): string =>  path.join(cwd, 'test');
export const getCypressDirectoryPath = (cwd: string): string => path.join(cwd, 'cypress');
export const getPackageJsonPath = (cwd: string): string => path.join(cwd, 'package.json');