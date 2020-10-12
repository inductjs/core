import {green, magenta, red} from "chalk";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import fs from "fs";
import express, {Application} from "express";
import {metaHandler} from "../express/meta-handler";
import { InductController, ControllerMap } from "./types";
import { ApplicationOpts } from "./app-schema";
import { mongoose } from "@typegoose/typegoose";
import Knex from "knex";

/* eslint-disable no-invalid-this */

export class InductApp {
    private opts: ApplicationOpts;
    private _port: string | number;
    private _express: Application;
    private _contFolder: string;
    private _controllers: ControllerMap<any>;
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
        this._contFolder = opts.controllerFolder || "src/controllers";

        this._config();

        // this.errorHandling();
    }

    get controllers(): ControllerMap<any> {
        return this.controllers;
    }

    /**
     * @class Server
     * @method config
     * Mounts middleware functions to the express application
     */
    private _config(): void {
        this._express.use(bodyParser.json({limit: "50mb"}));
        this._express.use(bodyParser.urlencoded({extended: false, limit: "50mb"}));
        this._express.use(cookieParser());
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

    public addController = (ctrlr: InductController<any>): void => {
        this._controllers.set(ctrlr.basePath, ctrlr);
    }

    /** Loads all the induct controller files from the given directory. Default: src/controllers */
    public loadControllerFiles = async (): Promise<void> => {
        const fullDir = path.join(process.cwd(), this._contFolder);

        const files = fs.readdirSync(fullDir);

        for (const file of files) {
            const fullName = path.join(fullDir, file);

            const fileName = file.toLowerCase();

            if (
                fileName.indexOf(".js") ||
                fileName.indexOf(".ts")
            ) {
                try {
                    const controller = await import(fullName) as InductController<any>;

                    const route = `/${controller.basePath || fileName.split(".")[0]}`;

                    if (controller) {
                        this._express.use(route, controller.router);
                    } else {
                        throw new TypeError(
                            `[error] could not load router module from ${fullName} on path ${route}.`
                        );
                    }

                    console.log(magenta(`[route] mounted ${route}`));
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

        this._express.get("/meta", metaHandler(this._express as express.Express));
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

export const induct = async (opts: ApplicationOpts): Promise<InductApp> => {
    const server = new InductApp(opts);

    if (opts.controllerFolder) await server.loadControllerFiles();
    if (opts.serveSPA) server.addStaticPath();

    server.mount();

    return server;
};

export default InductApp;

