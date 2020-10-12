require("dotenv").config();
import {createServer} from "@inductjs/core";

(async function(): Promise<void> {
  // InductServer auto mounts routers from src/routers ending in -router.{js, ts}
  const server = await createServer();

  server.start();
})();
