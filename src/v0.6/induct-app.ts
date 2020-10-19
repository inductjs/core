import {green, magenta, red} from "chalk";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import fs from "fs";
import express, {Application as ExpressApplication} from "express";
import {metaHandler} from "../express/meta-handler";
import { Controller } from "./induct-controller";
import { ApplicationOpts } from "./types/ApplicationOptions";
import { mongoose } from "@typegoose/typegoose";
import Knex from "knex";

/* eslint-disable no-invalid-this */
export class Application {
    private opts: ApplicationOpts;
    private _port: string | number;
    private _express: ExpressApplication;
    private _contFolder: string | false;
    private _controllers: Array<Controller<any>>;
    private _rootNs: string;
    private _db: Knex | mongoose.Connection;

    /**
     * @class Server
     * @method constructor
     * Initializes an express app with contents specified in the class
     */
    constructor(opts: ApplicationOpts) {
        this.opts = opts;
        this._express = express();
        this._port = opts.port || 3000;
        this._rootNs = opts.rootNamespace || "api";
        this._contFolder = opts.controllerLoader !== false
            ? opts.controllerLoader || "src/controllers"
            : false;
        this._controllers = [];
        this._db = opts.db;

        this._config();

        // this.errorHandling();
    }

    get controllers(): Controller<any>[] {
        return this._controllers;
    }

    /**
     * @class Server
     * @method config
     * Mounts middleware functions to the express application
     */
    private _config(): void {
        this._express.use(cookieParser());
        this._express.use(bodyParser.json({limit: "50mb"}));
        this._express.use(bodyParser.urlencoded({extended: false, limit: "50mb"}));
        this._express.use(compression());
    }

    /*
    securityEssentials(): void {
        this._app.use(helmet);
        ... etc
    }
    */

    // OPTION: SPA
    public addStaticPath(): void {
        let staticPath: string;

        if (process.env.NODE_ENV === "production") {
            staticPath = "../static";
        } else {
            staticPath = "../../dist/static";
        }

        this._express.use(express.static(path.join(__dirname, staticPath)));

        this._express.get("/", (req, res) => {
            res.sendFile("index.html", {
                root: path.join(__dirname, staticPath),
            });
        });

        this._express.get("*", (req, res) => {
            res.sendFile("index.html", {
                root: path.join(__dirname, staticPath),
            });
        });
    }

    public addController = (ctrlr: Controller<any>): void => {
        if (!ctrlr.db) ctrlr.db = this._db;

        this._controllers.push(ctrlr);
    }

    /** Loads all the induct controller files from the given directory. Default: src/controllers */
    public loadControllerFiles = async (): Promise<void> => {
        const fullDir = path.join(process.cwd(), this._contFolder as string);

        const files = fs.readdirSync(fullDir);

        for (const file of files) {
            const fullName = path.join(fullDir, file);

            const fileName = file.toLowerCase();

            if (
                fileName.indexOf(".js") ||
                fileName.indexOf(".ts")
            ) {
                try {
                    const controller = await import(fullName);

                    if (!controller) {
                        throw new TypeError(
                            `[error] could not load router module from ${fullName}`
                        );
                    } else {
                        this._controllers.push(controller.default);
                    }

                    console.log(magenta(`[route] mounted /${controller.basePath || fileName.split(".")[0]}`));
                } catch (e) {
                    console.log(red(e));
                }
            }
        }
    };

    /** Mounts all the controllers currently loaded in the application instance */
    public mount = (): void => {
        this._controllers.forEach((c) => {
            // set db object for each controller if not set already
            if (!c.db) c.db = this._db;
            // mount to express app
            this._express.use(`/${this._rootNs}/${c.basePath}`, c.router);
        });

        // Add meta route if router has routes
        if (this._express._router) {
            this._express.get("/meta", metaHandler(this._express as express.Express));
        }
    }

    /**
     * @class Server
     * @method start
     * @Remarks Starts an HTTP server on the specified port
     */
    public start(): void {
        try {
            this._express.listen(this._port, () =>
                console.log(
                    green(
                        `[info] HTTP server is listening on port ${this._port}`
                    )
                )
            );
        } catch (e) {
            console.log(e);
        }
    }
}

export const induct = async (opts: ApplicationOpts): Promise<Application> => {
    const server = new Application(opts);

    if (opts.controllerLoader !== false) await server.loadControllerFiles();
    if (opts.serveSPA) server.addStaticPath();

    server.mount();

    return server;
};

export default ExpressApplication;

