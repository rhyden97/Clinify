import express from "express";
import helmet from "helmet";
import type { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.config.js";
import { indexRouter } from "./routes/index.Routes.js";
import globalErrorMiddleware from "./middlewares/globalerror.middleware.js";

const server: Express = express();

server.use(helmet());
server.use(cors({
  origin: env.CLIENT_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));
server.use(cookieParser());
server.use(express.json());
server.use("/api/v1", indexRouter);
server.use(globalErrorMiddleware);

server.listen(env.SERVER_PORT, () => {
  console.log(`Server running in port ${env.SERVER_PORT}`);
});
