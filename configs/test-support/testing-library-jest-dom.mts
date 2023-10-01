/* eslint-disable import/no-unresolved */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
