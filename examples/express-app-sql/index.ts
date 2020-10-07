import { createServer } from "http";
import express from "express";
import { router as customerRouter } from "./router";
import { router as productRouter } from "./custom-model";
import bodyParser from "body-parser";

import {metaHandler} from "@inductjs/core"

const app = express();
app.use(bodyParser.json());

app.use("/customer", customerRouter);
app.use("/product", productRouter);

app.get("/meta", metaHandler(app));

const server = createServer(app);

server.listen(4000, () =>
  console.log(`[info] HTTP server is listening on port 4000`)
);
