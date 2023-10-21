declare global {
	namespace NodeJS {
		interface ProcessEnv {
			readonly NODE_ENV: string;
			readonly NODE_PATH?: string;
			readonly NO_VITEST?: string;
			readonly CYPRESS?: string;
		}
	}
}
