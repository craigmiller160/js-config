import {describe, it, expect} from 'vitest';
import {runCommandSync} from '../../../scripts/utils/runCommand';
import {either} from 'fp-ts';

describe('runCommand', () => {
    describe('runCommandSync', () => {
        it('runs command successfully with default options', () => {
            const result = runCommandSync('ls -l package.json');
            expect(result).toEqualRight('');
        });

        it('runs command successfully and returns output', () => {
            const result = runCommandSync('ls -l package.json', {
                stdio: 'pipe'
            });
            expect(result).toBeRight();
            const value = (result as either.Right<string>).right;
            expect(value.trim().endsWith('package.json')).toEqual(true);
        });

        it('runs command with error with default options', () => {
            const result = runCommandSync('ls -l package.json2');
            expect(result).toEqualLeft(new Error(`Command failed. Status: 1 Message: `));
        })

        it('runs command with error and returns output', () => {
            const result = runCommandSync('ls -l package.json2', {
                stdio: 'pipe'
            });
            expect(result).toEqualLeft(new Error(`Command failed. Status: 1 Message: ls: package.json2: No such file or directory\n`));
        })
    })
})