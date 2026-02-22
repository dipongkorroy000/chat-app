import {Server} from "http";
import app from "./app";
import env from "./app/env";
// import {connectRabbitMQ, closeRabbitMQ} from "./app/config/rabbitmq";
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

const gracefulShutdown = async () => {
  console.log("⚠️ Shutting down gracefully...");
  if (server) {
    server.close(() => {
      console.log("❌ HTTP server closed");
    });
  }
  // await closeRabbitMQ();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("unhandledRejection", async (err) => {
  console.log("😈 Unhandled rejection:", err);
  await gracefulShutdown();
});

process.on("uncaughtException", async (err) => {
  console.log("😈 Uncaught exception:", err);
  await gracefulShutdown();
});
