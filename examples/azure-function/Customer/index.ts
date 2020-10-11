import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {InductSQL} from "@inductjs/core";
import { CustomerClass } from "../schema";
import db from "../database";

const main: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  const induct = new InductSQL({
    connection: db,
    schema: CustomerClass,
    idField: "CustomerID",
    tableName: "SalesLT.Customer",
  });

  const router = induct.azureHttpTrigger();

  const res = await router(context, req);

  context.res = res;
};
export default main;
