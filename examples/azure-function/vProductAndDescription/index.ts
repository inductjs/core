import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { vProductAndDescriptionClass } from "../schema";
import { InductSQL } from "@inductjs/core";
import db from "../database";

const main: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  const induct = new InductSQL({
    connection: db,
    schema: vProductAndDescriptionClass,
    idField: "ProductID",
    tableName: "SalesLT.vProductAndDescription",
  });

  const router = induct.azureHttpTrigger();

  const res = await router(context, req);

  context.res = res;
};
export default main;
