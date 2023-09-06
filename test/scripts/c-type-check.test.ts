import {describe, it} from 'vitest';

describe('c-type-check', () => {
    it('runs the base type check only', () => {
        throw new Error();
    })

    it('runs the type check once using the test config', () => {
        throw new Error();
    });

    it('runs the type check twice, using the base config and cypress config', () => {
        throw new Error();
    })
});