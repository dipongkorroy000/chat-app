import amqplib from "amqplib";
import env from "../env";

let channel: amqplib.Channel;

async function tryConnectRabbitMQ(attempt = 1, maxAttempts = 3, delay = 2000): Promise<void> {
  try {
    // ----- for development ------
    // if (!env.rabbitMQ.hostname || !env.rabbitMQ.port || !env.rabbitMQ.username || !env.rabbitMQ.password) {
    //   throw Error("❌ Env to rabbitMQ");
    // }

    // const connection = await amqplib.connect({
    //   protocol: "amqp",
    //   hostname: env.rabbitMQ.hostname,
    //   port: Number(env.rabbitMQ.port),
    //   username: env.rabbitMQ.username,
    //   password: env.rabbitMQ.password,
    // });
    const connection = await amqplib.connect(env.rabbitmq_url as string);

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err);
    });

    channel = await connection.createChannel();

    console.log("✅ Connected to RabbitMQ");
  } catch (error) {
    console.error(`❌ Failed to connect RabbitMQ (attempt ${attempt})`, error);

    if (attempt < maxAttempts) {
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);

      await new Promise((res) => setTimeout(res, delay));

      return tryConnectRabbitMQ(attempt + 1, maxAttempts, delay); // recursive call
    } else {
      console.error("❌ All RabbitMQ connection attempts failed");
    }
  }
}

export const connectRabbitMQ = async () => {
  await tryConnectRabbitMQ();
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("RabbitMq channel is not initialized");
    return;
  }

  await channel.assertQueue(queueName, {durable: true});
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {persistent: true});
};
