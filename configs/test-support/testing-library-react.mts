/* eslint-disable import/no-unresolved */

import { afterEach } from 'vitest';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { cleanup } from '@testing-library/react';

afterEach(() => {
	 
	cleanup();
});
