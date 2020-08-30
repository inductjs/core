![CI](https://github.com/Yeseh/induct-core/workflows/CI/badge.svg?branch=master)

# Induct

Library that provides abstractions over ExpressJS in order to quickly create REST APIs from an SQL Database for prototyping purposes.

## Getting Started

Install Induct Core as a dependency:

> npm install @induct/core --save

### Define a schema

Define a class to provide Induct with type information. Class-validator decorators are supported for incoming schema validation.

```typescript
// schema.ts
export class UserSchema {
    @IsUUID()
    uuid: string;
    @IsString()
    name: string;
    @IsInt()
    age: number;

    constructor(val: UserSchema) {
        this.uuid = val.uuid;
        this.name = val.name;
        this.age = val.age;
    }
}
```

### Create a router

Initialize Induct and provide a database object, an object schema, the table to query, and the field to use as ID parameter.

```typescript
// router.ts
const induct = new Induct({
    connection: knex, // Knex connection object to your database
    schema: UserSchema,
    tableName: "dbo.users",
    idField: "uuid",
    idParam: "user_uuid", // OPTIONAL: custom param name for the id field
    fieldsList: ["uuid", "name"], // OPTIONAL: limit fields retrieved
});

const router = induct.router();
```

This method will create an express router with the following routes:

GET / retrieve all records in the table
GET /:idParam retrieve one record
POST / create one record
PATCH /:idParam update one record
DELETE /:idParam delete one record

### Setup a server

Finally, create an express entry point as usual, and bring in the created router:

```typescript
// index.ts
import {createServer} from "http";
import express from "express";
import {router} from "./router";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json({limit: "50mb"})); // Make sure you are using body parser!

app.use("/users", router);

const server = createServer(app);

server.listen(4000, () => console.log(`Server is listening on port 4000`));
```

## Other usage options

Induct exposes several levels of abstraction. The getting started example highlights the quickest way to expose a full table as a REST API, but the individual building blocks can be used separately too.

### Generic route handlers

You can generate express route handlers using the lookupHandler (for GET requests) and modifyHandler (for POST, PATCH, DELETE requests) functions.

```typescript
const router = express.Router();

router.get("/", induct.lookupHandler("findAll", {all: true}));
router.get(`/:${induct.idParam}`, induct.lookupHandler("findOneById"));

router.patch(
    `/:${induct.idParam}`,
    induct.modifyHandler("update", {validate: true})
);
router.post(`/`, induct.modifyHandler("create", {validate: true}));
router.delete(`/:${induct.idParam}`, induct.modifyHandler("update"));
```

These route handlers still use the generic InductModel

## Example Application

An full example application can be found [here](https://github.com/Yeseh/induct-core-test).

# License

MIT
