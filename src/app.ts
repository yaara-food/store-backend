import "reflect-metadata";

import express from "express";
import cors from "cors";
import routes from "./routes";
import {initDBMiddleware} from "./db";

const app = express();
const allowedOrigins = [
    "http://localhost:3000",
    "https://yaara-store.vercel.app",
    "https://yaara-tau.vercel.app",
    "https://store.yaarafoodforest.com",
];
app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);


app.use(express.json());

app.use(initDBMiddleware);
app.use("/", routes);

export default app;
