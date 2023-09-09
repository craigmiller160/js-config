import path from 'path';
import fs from 'fs';

export const execute = () => {
	const logText = fs.readFileSync(
		path.join(__dirname, '..', 'command.log'),
		'utf8'
	);
	// eslint-disable-next-line
	console.log(logText);
};
