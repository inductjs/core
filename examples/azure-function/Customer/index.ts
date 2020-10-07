require("dotenv").config();
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { HttpResponse } from "azure-functions-ts-essentials";

import { CustomerClass } from "../schema";
import {InductAzure} from "@inductjs/core";
import db from "../database";

const main: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let res: HttpResponse;

  const induct = new InductAzure({
    connection: db,
    schema: CustomerClass,
    idField: "CustomerID",
    tableName: "SalesLT.Customer",
  });

  const router = induct.azureHttpTrigger();

  res = await router(context, req);

  context.res = res;
};
export default main;
