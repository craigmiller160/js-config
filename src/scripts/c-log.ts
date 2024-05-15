import fs from 'fs';
import { LOG_FILE } from './logger';

export type LogToStdout = (logText: string) => void;

export const execute = (
    // eslint-disable-next-line no-console
    logToStdout: LogToStdout = console.log,
    logFile: string = LOG_FILE
) => {
    const logText = fs.readFileSync(logFile, 'utf8');
    logToStdout(logText);
};
