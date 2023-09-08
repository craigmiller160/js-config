const config = require('./configs/eslint/.eslintrc.js');

module.exports = {
    ...config,
    env: {
        node: true
    }
};