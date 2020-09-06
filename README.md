![CI](https://github.com/Yeseh/induct-core/workflows/CI/badge.svg?branch=master)

# Induct

Induct provides abstractions over ExpressJS in order to quickly create REST APIs from an SQL Database for prototyping purposes. Usage with typescript is fully supported and encouraged!

Induct uses [Knex](https://knexjs.org/) to query databases, and therefore will only support databases supported by Knex.

## Getting Started

Install Induct Core as a dependency of your project:

> npm install @yeseh/induct-core --save

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
const induct = new InductExpress({
    connection: knex, // Knex connection object to your database
    schema: UserSchema,
    tableName: "dbo.users",
    idField: "uuid",
    idParam: "user_uuid", // OPTIONAL: custom param name for the id field
    fieldsList: ["uuid", "name"], // OPTIONAL: limit fields retrieved
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
import {inductRouter} from "./router";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json({limit: "50mb"})); // Make sure you are using body parser!

app.use("/users", inductRouter);

const server = createServer(app);

server.listen(4000, () => console.log(`Server is listening on port 4000`));
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

You can create generic express route handlers for InductModel methods using the induct.handler() method:

```typescript
const router = express.Router();

router.get("/", induct.handler("findAll"));
// Second parameter of induct.handler accepts additional options that override class instance options
router.post(`/`, induct.handler("create", {validate: true}));

router.get(`/:${induct.idParam}`, induct.handler("findOneById"));
router.patch(`/:${induct.idParam}`, induct.handler("update", {validate: true}));
router.delete(`/:${induct.idParam}`, induct.handler("update"));
```

These handlers use the generic InductModel methods to query your database.

### Use InductModel in custom route handler

You can use Inducts generic model class in your own route handlers as follows:

```typescript
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
    }

    getCatalogVersion = () => {
        return "1.0";
    };

    updateCatalogVersion = () => {
        // The values from the request body are stored in this.model
        return `Catalog version updated to: ${this.model.CatalogVersion}`;
    };
}
```

Next we can instantiate Induct, and register our methods for use in the generic handlers:

```javascript
const induct = new InductExpress({
    connection: knex,
    schema: UserSchema,
    tableName: "dbo.users",
    idField: "uuid",
    // Provide your custom model constructor
    customModel: ProductModel,
    // Register custom functions
    queries: ["getCatalogVersion"],
    mutations: ["updateCatalogVersion"],
});

// Create a router as normal
const router = induct.router();

// Add additional handlers
router.get("/catalog/version", induct.handler("getCatalogVersion"));
router.patch("/catalog/version", induct.handler("updateCatalogVersion"));

export {router};

/*
NOTE: When using extra custom handlers in addition to induct.router, take into account that routes have already been mounted to /:id
This can lead to situations where the wrong handler is executed
Because of this we first add /catalog to the path to prevent route conflicts
*/
```

Alternatively you can use the `registerModelFunction` method, which accepts your custom model as a type parameter to help your IDE with autocompletion:

```typescript
import {FunctionType} from "@yeseh/induct-core";

induct.registerModelFunction<ProductModel>(
    FunctionType.Query,
    "getCatalogVersion"
);
induct.registerModelFunction<ProductModel>(
    FunctionType.Mutation,
    "updateCatalogVersion"
);
```

## Example

A complete example can be found [here](https://github.com/Yeseh/induct-core-test).

# Contributing

Contributions are welcome! If you want to contribute, please follow these steps:

1. Create an issue with the `suggestion` label, and explain your suggestion in as much detail as possible;
2. Once your suggestion is approved, fork the repository;
3. Work on your suggestion, make sure you add tests if applicable, and all tests are passing;
4. Open a pull request to the `staging` (default) branch;

# License

MIT
