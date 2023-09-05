import {describe, it, expect} from 'vitest';
import {runCommandSync} from '../../../scripts/utils/runCommand';

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
            expect(result).toEqualRight('-rw-r--r--@ 1 craigmiller  staff  935 Sep  3 23:14 package.json\n');
        });

        it('runs command with error with default options', () => {
            throw new Error();
        })

        it('runs command with error and returns output', () => {
            throw new Error();
        })
    })
})