module.exports = import('./configs/eslint/eslint.config.mjs').then(
	({ default: theDefault }) => theDefault
);
