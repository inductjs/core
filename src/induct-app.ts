import path from 'path';
import { bold } from 'chalk';
import { json as bodyParserJson, urlencoded as bodyParserUrlEnc } from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import fs from 'fs';
import helmet from 'helmet';
import express from 'express';
// import { metaHandler } from './handlers/meta-handler';
import { ApplicationOpts } from './types/ApplicationOptions';
import { logError, logInfo } from './helpers/logging';
import { errorHandler } from './middleware';

interface ControllerFile {
	path: string;
	router: express.IRouter;
}

const app = express();

/* eslint-disable no-invalid-this */
function mountAppLevelMiddleware(): void {
	app.use(cookieParser());
	app.use(bodyParserJson({ limit: '50mb' }));
	app.use(bodyParserUrlEnc({
		extended: false,
		limit: '50mb',
	}));
	app.use(compression());
	app.use(helmet());
}

function configureServeStaticPath(): void {
	let staticPath = process.env.NODE_ENV === 'production'
		? '../static'
		: '../../dist/static';

	app.use(express.static(path.join(__dirname, staticPath)));

	app.get('/', (req, res) => {
		res.sendFile('index.html', { root: path.join(__dirname, staticPath) });
	});

	app.get('*', (req, res) => {
		res.sendFile('index.html', { root: path.join(__dirname, staticPath) });
	});
}

async function loadControllerFiles(folder: string): Promise<ControllerFile[]> {
	const controllers = [] as ControllerFile[];
	const fullDir = path.join(process.cwd(), folder);

	console.log('looking for controller files in ', fullDir);

	for (const file of fs.readdirSync(fullDir)) {
		console.log(file);
		const fullPath = path.join(fullDir, file),
			ext = file.toLowerCase().substr(file.length -2);

		if (ext !== 'js' && ext !== 'ts') {
			continue;
		}

		try {
			const controller = (await import(fullPath)).default;
			const path = file.substring(0, file.length -3);

			console.log({controller})

			if (!controller) {
				throw new TypeError(
					`[error] could not load router module from ${fullPath}. Does the file have a default export?`
				);
			}

			controllers.push({
				path,
				router: controller,
			});
		}
		catch (e) {
			logError(e);
			throw e;
		}
	}

	return controllers;
};

function mountControllers(rootNs: string, files: ControllerFile[]): void {
	for (const file of files) {
		const path = `/${rootNs}/${file.path}`;
		app.use(path, file.router);

		logInfo(`[route] mounted ${path}`);
	}
}

// function mountMetaHandler(): void {
//	app.get('/meta', metaHandler(this._express as express.Express));
// }

function mountErrorHandler(): void {
	app.use(errorHandler);
}

export async function createApp(opts: ApplicationOpts):
	Promise<{ app: express.Express; start: () => void}> {
	const rootNs = opts.rootNamespace ?? 'api';
	const port = opts.port ?? 3000;
	const controllerFolder = opts.controllerFolder ?? './src/controllers';

	const controllers = await loadControllerFiles(controllerFolder);
	console.log(controllers.length)

	mountAppLevelMiddleware();
	if (controllers.length) {
		mountControllers(rootNs, controllers);
	}
	//	mountMetaHandler();
	if (opts.serveSPA) {
		configureServeStaticPath();
	}

	mountErrorHandler();

	function start(): void {
		app.listen(port, () => logInfo(
			`[info] HTTP server is listening on port ${bold(port)}`
		));
	}

	return {
		app,
		start,
	};
}
