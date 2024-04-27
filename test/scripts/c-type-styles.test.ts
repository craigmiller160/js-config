import { MockedFunction, vi, test, beforeEach, expect } from 'vitest';
import { RunCommandSync } from '../../src/scripts/utils/runCommand';
import { execute } from '../../src/scripts/c-type-styles';
import { either } from 'fp-ts';
import {
	TYPED_CSS_MODULES,
	TYPED_SCSS_MODULES
} from '../../src/scripts/commandPaths';

const mockRunCommandSync: MockedFunction<RunCommandSync> = vi.fn();

beforeEach(() => {
	vi.resetAllMocks;
});

test('generates types for css & scss files', () => {
	mockRunCommandSync.mockReturnValue(either.right(''));
	execute({
		process,
		runCommandSync: mockRunCommandSync
	});

	expect(mockRunCommandSync).toHaveBeenCalledTimes(2);
	expect(mockRunCommandSync).toHaveBeenNthCalledWith(
		1,
		`${TYPED_CSS_MODULES} -p 'src/**/*.module.css'`
	);
	expect(mockRunCommandSync).toHaveBeenNthCalledWith(
		2,
		`${TYPED_SCSS_MODULES} 'src/**/*.module.scss'`
	);
});
