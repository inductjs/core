import mongoose from "mongoose";
import {createServer} from "@inductjs/core";

// Export mongoose connection object to use in models
export let con;

(async function(): Promise<void> {
    await mongoose.connect("mongodb://<your connection string here>", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });

    con = mongoose.connection;

    console.log("[info] connected to MongoDB");

    // InductServer auto mounts routers from src/routers ending in -router.{js, ts}
    const server = await createServer();

    server.start();
})();
