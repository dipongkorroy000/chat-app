// server.ts
import env from "./app/env";
import {connectMongo} from "./app/config/db";
import {server} from "./app/config/socket";

async function main() {
  try {
    await connectMongo();

    server.listen(env.port, () => {
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
