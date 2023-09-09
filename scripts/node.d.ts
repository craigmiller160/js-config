declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly NODE_PATH?: string;
		}
	}
}

export {};
