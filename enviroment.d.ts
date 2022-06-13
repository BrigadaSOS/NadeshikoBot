declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOTTOKEN: string;
            guildId: string;
            environment: "dev" | "prod" | "debug";
        }
    }
}

export {};
