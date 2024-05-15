import { afterEach, beforeEach, describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { setupStylelint } from '../../../src/scripts/init/setupStylelint';
import { Stylelintrc } from '../../../src/scripts/files/Stylelintrc';

const WORKING_DIR = path.join(
    process.cwd(),
    'test',
    '__working_directories__',
    'stylelint'
);
const STYLELINT_PATH = path.join(WORKING_DIR, '.stylelintrc.json');
const EXPECTED_CONFIG: Stylelintrc = {
    extends: '@craigmiller160/js-config/configs/stylelint/.stylelintrc.json',
    rules: undefined
};
const clearDirectory = () =>
    fs
        .readdirSync(WORKING_DIR)
        .filter((fileName) => '.gitkeep' !== fileName)
        .map((fileName) => path.join(WORKING_DIR, fileName))
        .forEach((filePath) =>
            fs.rmSync(filePath, {
                recursive: true,
                force: true
            })
        );

describe('setupStylelint', () => {
    beforeEach(() => {
        clearDirectory();
    });
    afterEach(() => {
        clearDirectory();
    });
    it('sets up stylelint config file', () => {
        setupStylelint(WORKING_DIR);
        expect(fs.existsSync(STYLELINT_PATH)).toBe(true);
        const content = JSON.parse(
            fs.readFileSync(STYLELINT_PATH, 'utf8')
        ) as Stylelintrc;
        expect(content).toEqual(EXPECTED_CONFIG);
    });

    it('replaces existing config file if invalid', () => {
        const invalidConfig: Stylelintrc = {
            extends: 'other-config',
            rules: undefined
        };
        fs.writeFileSync(STYLELINT_PATH, JSON.stringify(invalidConfig));

        setupStylelint(WORKING_DIR);
        expect(fs.existsSync(STYLELINT_PATH)).toBe(true);
        const content = JSON.parse(
            fs.readFileSync(STYLELINT_PATH, 'utf8')
        ) as Stylelintrc;
        expect(content).toEqual(EXPECTED_CONFIG);
    });

    it('does nothing if stylelint config already exists', () => {
        const config: Stylelintrc = {
            ...EXPECTED_CONFIG,
            rules: {
                rule1: true
            }
        };
        fs.writeFileSync(STYLELINT_PATH, JSON.stringify(config));

        setupStylelint(WORKING_DIR);
        expect(fs.existsSync(STYLELINT_PATH)).toBe(true);
        const content = JSON.parse(
            fs.readFileSync(STYLELINT_PATH, 'utf8')
        ) as Stylelintrc;
        expect(content).toEqual(config);
    });
});
