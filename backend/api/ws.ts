import { createApplicationServer } from "../src/server/websocketServer.js";

const { httpServer } = createApplicationServer();

export default httpServer;
