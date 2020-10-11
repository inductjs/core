require("dotenv").config();
import {createServer} from "@inductjs/core";

(async function() {
  // InductServer auto mounts routers from src/routers ending in -router.{js, ts}
  const server = await createServer();

  server.start();
})();
