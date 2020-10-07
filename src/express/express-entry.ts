import {blue, green, magenta} from "chalk";
import path from "path";
import bodyParser from "body-parser";
import fs from "fs";
import express, {Application} from "express";

/* eslint-disable no-invalid-this */

export class InductServer {
    private _app: Application;
    public port: string | number;

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
     */

    public static bootstrapTest(): InductServer {
        return new InductServer();
    }

    /**
     * @class Server
     * @method constructor
     * Initializes an express app with contents specified in the class
     */
    constructor() {
        this._app = express();
        this.port = process.env.PORT || 3000;


        this.config();
        // this.setStatic();
        // this.errorHandling();
    }

    /**
     * @class Server
     * @method config
     * Mounts middleware functions to the express application
     */
    config(): void {
        this._app.use(bodyParser.json({limit: "50mb"}));
        this._app.use(bodyParser.urlencoded({extended: false, limit: "50mb"}));
    }

    /*
    securityEssentials(): void {
        this._app.use(helmet);
        ... etc
    }
    */

    // OPTION: SPA
    setStatic(): void {
        let staticPath: string;

        if (process.env.NODE_ENV === "production") {
            staticPath = "../static";
        } else {
            staticPath = "../../dist/static";
        }

        this._app.use(express.static(path.join(__dirname, staticPath)));

        this._app.get("/", (req, res) => {
            res.sendFile("index.html", {
                root: path.join(__dirname, staticPath),
            });
        });

        this._app.get("*", (req, res) => {
            res.sendFile("index.html", {
                root: path.join(__dirname, staticPath),
            });
        });
    }

    mountRoutes = async (dirName?: string): Promise<void> => {
        const folder = "../../../mongo-test/routes";// dirName ?? "routes";

        const testPath = path.join(__dirname, folder);

        const files = fs.readdirSync(testPath);

        for (const file of files) {
            const fullName = path.join(testPath, file);

            const stat = fs.lstatSync(fullName);

            const fileName = file.toLowerCase();

            if (stat.isDirectory()) {
                this.mountRoutes(fullName);
            } else if (fileName.indexOf("-router.js")) {
                const route = `/${fileName.split("-")[0]}`;

                const module = await import(fullName);

                this._app.use(route, module.router);

                console.log(magenta(`[route] mounted ${route}`));
            };
        }
    }

    /**
     * @class Server
     * @method start
     * @Remarks Starts an HTTP server on the specified port
     */
    public start(): void {
        try {
            this._app.listen(this.port, () =>
                console.log(
                    green(`[info] HTTP server is listening on port ${this.port}`)
                )
            );
        } catch (e) {
            console.log(e);
        }
    }
}

export const createServer = async () => {
    const server = new InductServer();

    await server.mountRoutes();

    return server;
};

export default InductServer;
