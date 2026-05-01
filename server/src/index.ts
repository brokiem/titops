import {createApp} from "./app";
import {getServerEnv} from "./config/env";

const env = getServerEnv();

const app = createApp({env});

export default app;