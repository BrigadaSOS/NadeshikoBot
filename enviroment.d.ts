declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            guild_id: string;
            environment: "dev" | "prod" | "debug";
        }
    }
}

export {};
