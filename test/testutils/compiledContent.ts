export const createEsmContent = (
    varName: string,
    value: string,
    includeEslintDisable: boolean = false
): string =>
    `${
        includeEslintDisable ? '/* eslint-disable */ ' : ''
    }export const ${varName} = '${value}';\n`;

export const createCjsContent = (
    varName: string,
    value: string,
    includeEslintDisable: boolean = false
) => `${includeEslintDisable ? '/* eslint-disable */ ' : ''}"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "${varName}", {
    enumerable: true,
    get: function() {
        return ${varName};
    }
});
const ${varName} = '${value}';
`;
