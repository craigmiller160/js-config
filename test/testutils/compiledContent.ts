export const createEsmContent = (varName: string, value: string): string =>
	`/* eslint-disable */ export const ${value} = '${value}';\n`;

export const createCjsContent = (
	varName: string,
	value: string
) => `/* eslint-disable */ "use strict";
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
