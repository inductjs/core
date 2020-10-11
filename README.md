<p align="center">
  <img src="https://imgur.com/JRp3or5.png">
   </br>
   </br>
  <img src="https://github.com/inductjs/core/workflows/CI/badge.svg?branch=master">
</p>

Induct is an extensible framework built on top of ExpressJS used for quickly creating REST APIs based on an SQL or mongodb database. Usage with typescript is fully supported and encouraged!

Induct uses [Knex](https://knexjs.org/) to query SQL databases, and therefore will only support databases supported by Knex. Currently Induct supports the following SQL databases:

-   Microsoft SQL Server
-   MySQL

Other Knex compatible databases (such as Postgres & Oracle)  will be supported in the future.

## Getting Started

Install Induct Core as a dependency of your project:

> npm install @inductjs/core --save

With yarn:

> yarn add @inductjs/core

### Define a schema

Define a class to provide Induct with type information. Class-validator decorators are supported for incoming schema validation.

```typescript
// schema.js
export class UserSchema {
    @IsUUID()
    uuid: string;
    @IsString()
    name: string;
    @IsInt()
    age: number;

    constructor(val: UserSchema) {
        Object.assign(this, val);
    }
}
```

### Create an express router

Initialize Induct and provide a database object, an object schema, the table to query, and the field to use as ID parameter.

```javascript
// router.js
import {InductExpress} from "@yeseh/induct-core";

const induct = new InductExpress({
    connection: knex, // Knex connection object to your database
    schema: UserSchema,
    tableName: "dbo.users",
    idField: "uuid",
});

export const inductRouter = induct.router();
```

This method will create an express router with the following routes:

-   GET / retrieve all records in the table
-   GET /:idParam retrieve one record
-   POST / create one record
-   PATCH /:idParam update one record
-   DELETE /:idParam delete one record

### Setup a server

Finally, create an express entry point as usual, and bring in the created router:

```javascript
// index.js
import {createServer} from "http";
import express from "express";
import bodyParser from "body-parser";

import {inductRouter} from "./router";

const app = express();

app.use(bodyParser.json()); // Make sure you are using body parser!
app.use("/users", inductRouter);

const server = createServer(app);

server.listen(3000, () => console.log(`Server is listening on port 3000`));
```

## Azure functions router

The InductAzure class exposes a generic router for Azure HTTP trigger functions. The index.js of your function could look like this:

```javascript
// index.js
import {InductAzure} from "@yeseh/induct-core";

const induct = new InductAzure({
    connection: db,
    schema: UserSchema,
    idField: "user_uuid",
    tableName: "SalesLT.Customer",
});

const main = async function (context, req) {
    let res;

    const router = induct.azureFunctionsRouter(opts);

    res = await router(context, req);

    context.res = res;
};

export default main;
```

## Other usage options

Induct exposes several levels of abstraction. The getting started example highlights the quickest way to expose a full table as a REST API, but the individual building blocks can be used separately too.

### Generic route handlers

You can create generic express route handlers for InductModel methods using the `query` (for GET requests) and `mutation` (for POST, PATCH, DELETE requests) method:

```javascript
const router = express.Router();

router.get("/", induct.query("findAll"));
// Second parameter of induct.handler accepts additional options that override class instance options
router.post(`/`, induct.mutation("create", {validate: true}));

router.get(`/:${induct.idParam}`, induct.query("findOneById"));

router.patch(
    `/:${induct.idParam}`,
    induct.mutation("update", {validate: true})
);
router.delete(`/:${induct.idParam}`, induct.mutation("delete"));
```

These handlers use the generic InductModel methods to query your database.

### Use InductModel in custom route handler

You can use Inducts generic model class in your own route handlers as follows:

```javascript
// Create an Induct instance
const induct = new Induct({
    connection: knex, // Knex connection object to your database
    schema: UserSchema,
    tableName: "dbo.users",
    idField: "uuid",
});

// Create your custom route handler
export const routeHandler = async (req, res) => {
    // Get a model instance and lookup using the id parameter
    const model = await induct.model({uuid: req.params.id});
    const result = await model.findOneById();

    // Return a response based on the results of the query
    if (result && result[0]) return res.status(200).json(result);
    else return res.status(404).json({message: "Resource not found"});
};
```

### Using custom models

Lets say we want to create a GET route that returns the current version of the product catalog, and a PATCH route that can update the version.
So we create a custom model that extends from InductModel, and add our `getCatalogVersion` and `updateCatalogVersion` methods:

```javascript
export class ProductModel extends InductModel {
    constructor(val, opts) {
        super(val, opts);

        this.updateCatalogVersion = this.updateCatalogVersion.bind(this);
    }

    getCatalogVersion() {
        return "1.0";
    }

    updateCatalogVersion() {
        // The values from the request body are stored in this.model
        // So this.model.CatalogVersion is equivalent to req.body.CatalogVersion
        return `Catalog version updated to: ${this.model.CatalogVersion}`;
    }
}
```

A couple of things to take into account when using custom models:

1. Returning _NULL_ from a model method will result in a `400 BAD_REQUEST` response. Unless this is intended, return a non-null value such as an empty string or array from the model function.
2. Using arrow functions as class methods is \***\*NOT SUPPORTED\*\***. Using arrow functions causes these methods to not be bound to the prototype of the custom model, which Induct needs for some runtime validations. Make sure to use ordinary method syntax, and bind methods that need to use the class' _this_ context.
3. You can provide the `query` and `mutation` with your custom model as a type parameter, which will extend the method names typescript will accept with all the methods of your custom model.

Next we can instantiate Induct, and register our methods for use in the generic handlers:

```typescript
const induct = new InductExpress({
    connection: knex,
    schema: UserSchema,
    tableName: "dbo.users",
    idField: "uuid",
    // Provide your custom model constructor
    customModel: ProductModel,
});

// Create a router as normal
const router = induct.router();

// Add additional handlers.
router.get("/catalog/version", induct.query<ProductModel>("getCatalogVersion"));

router.patch(
    "/catalog/version",
    induct.mutation<ProductModel>("updateCatalogVersion")
);

export {router};
```

**NOTE:** When using extra custom handlers in addition to induct.router, take into account that routes have already been mounted to /:id
This can potentially lead to conflicting paths.

## Example

A complete example can be found [here](https://github.com/Yeseh/induct-core-test).

# License

MIT
