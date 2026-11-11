// Local Node entrypoint: starts the shared application server on a port for development/production runtime.
import {
  closeInfrastructureConnections,
  ensureInfrastructureReady
} from "./infrastructure/index.js";
import {
  createApplicationServer,
  listenApplicationServer
} from "./server/websocketServer.js";

await ensureInfrastructureReady();
const { httpServer, webSocketServer } = createApplicationServer();
listenApplicationServer(httpServer);
let isShuttingDown = false;

async function shutdown() {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  webSocketServer.close();
  httpServer.close();
  await closeInfrastructureConnections();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
