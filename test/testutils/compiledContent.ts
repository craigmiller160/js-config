export const createEsmContent = (varName: string, value: string): string =>
	`export const ${varName} = '${value}';\n`;

export const createCjsContent = (
	varName: string,
	value: string
) => `"use strict";
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
