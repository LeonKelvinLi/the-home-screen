import { createApp } from "./app.js";
import express from "express";

const instance = await createApp();
const port = Number(process.env.PORT || 8791);
const outer = express();
if (instance.basePath) outer.use(instance.basePath, instance.app);
else outer.use(instance.app);
const server = outer.listen(port, process.env.HOST || "127.0.0.1", () =>
  console.log(`BSTY Goods listening on port ${port}`),
);
let stopping = false;
const shutdown = async () => {
  if (stopping) return;
  stopping = true;
  server.close(async () => {
    await instance.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 15000).unref();
};
process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
