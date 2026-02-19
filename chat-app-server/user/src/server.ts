import {Server} from "http";
import app from "./app";
import env from "./app/env";
import {connectRabbitMQ} from "./app/config/rabbitmq";
import {connectMongo} from "./app/config/db";
import {connectRedis} from "./app/config/redis";

let server: Server;

async function main() {
  try {
    await connectMongo();

    await connectRabbitMQ();

    await connectRedis();

    server = app.listen(env.port, () => {
      console.log(`User server is listening on port ${env.port}`);
    });
  } catch (err) {
    console.log("😈 User server error, shutting down ...", err);
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
