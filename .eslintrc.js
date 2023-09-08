const config = require('./configs/eslint/.eslintrc.js');

module.exports = {
    ...config,
    extends: [
        ...config.extends,
        'plugin:vitest/recommended'
    ],
    env: {
        node: true
    }
};