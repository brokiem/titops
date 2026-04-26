import {createApp} from "./app";
import {getServerEnv} from "./config/env";

const env = getServerEnv();

const app = createApp({env});
const server = Bun.serve({
    hostname: "0.0.0.0",
    port: env.PORT,
    fetch: app.fetch,
});

console.log(`Server running on ${server.url}`);
