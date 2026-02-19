import {Server} from "http";
import mongoose from "mongoose";
import app from "./app";
import env from "./app/env";
import {connectMongo} from "./app/config/db";

let server: Server;

async function main() {
  try {
    connectMongo();

    server = app.listen(env.port, () => {
      console.log(`app is listening on port ${env.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on("unhandledRejection", (err) => {
  console.log(`😈 unhandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
