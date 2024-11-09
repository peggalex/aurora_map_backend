declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | undefined;
			WEATHER_API_KEY: string;
			MONGO_CONNECTION_STR: string;
		}
	}
}
export {};
