import { matchers as decodeMatchers } from '@relmify/jest-fp-ts/dist/decodeMatchers';
import { matchers as eitherMatchers } from '@relmify/jest-fp-ts/dist/eitherMatchers';
import { matchers as optionMatchers } from '@relmify/jest-fp-ts/dist/optionMatchers';
import { matchers as theseMatchers } from '@relmify/jest-fp-ts/dist/theseMatchers';
import { matchers as eitherOrTheseMatchers } from '@relmify/jest-fp-ts/dist/eitherOrTheseMatchers';
import { expect } from 'vitest';

expect.extend(decodeMatchers);
expect.extend(eitherMatchers);
expect.extend(optionMatchers);
expect.extend(theseMatchers);
expect.extend(eitherOrTheseMatchers);
