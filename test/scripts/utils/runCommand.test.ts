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
            throw new Error();
        })

        it('runs command with error and returns output', () => {
            throw new Error();
        })
    })
})