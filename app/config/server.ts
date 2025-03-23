import express from "express";
import cors from "cors";
import environments from "~/config/enviroments.config";
import { connectDB } from "~/config/db.config";
import { apiRouters } from "~/routers/api";
import { ServerErrorMiddleware } from "@vigilio/express-core/handler";
import { logger } from "@vigilio/express-core/helpers";
import {
    attachControllers,
    Container,
    ERROR_MIDDLEWARE,
} from "@vigilio/express-core";

export class Server {
    public readonly app: express.Application = express();

    constructor() {
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        connectDB();
    }

    routes() {
        const apiRouter = express.Router();
        attachControllers(apiRouter, apiRouters);
        Container.provide([
            { provide: ERROR_MIDDLEWARE, useClass: ServerErrorMiddleware },
        ]);
        this.app.use("/api", apiRouter);
    }

    listen() {
        const server = this.app.listen(environments.PORT, () => {
            logger.primary(`Run server in port ${environments.PORT}`);
        });

        return server;
    }
}
