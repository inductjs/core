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

```typescript
// router.ts
const induct = new Induct({
    connection: knex, // Knex connection object to your database
    schema: UserSchema,
    idField: "uuid",
    tableName: "users",
});

const router = induct.router();
```

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

## Example Application

An full example application can be found [here](https://github.com/Yeseh/induct-core-test).

# License

MIT
