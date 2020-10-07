require("dotenv").config();
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { HttpResponse, HttpMethod } from "azure-functions-ts-essentials";
import { vProductAndDescriptionClass } from "../schema";
import { InductAzure } from "@yeseh/induct-core/dist/";
import db from "../database";

const main: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  let res: HttpResponse;

  const induct = new InductAzure({
    connection: db,
    schema: vProductAndDescriptionClass,
    // @ts-ignore
    idField: "ProductID",
    tableName: "SalesLT.vProductAndDescription",
  });

  const router = induct.azureHttpTrigger();

  res = await router(context, req);

  context.res = res;
};
export default main;
