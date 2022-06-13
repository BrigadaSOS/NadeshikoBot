declare global {
    namespace NodeJS {
        interface ProcessEnv {
            bot_token: string;
            guild_id: string;
            environment: "dev" | "prod" | "debug";
        }
    }
}

export {};
