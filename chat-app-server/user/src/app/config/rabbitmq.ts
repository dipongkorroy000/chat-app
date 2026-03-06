import amqplib from "amqplib";
import env from "../env";

let channel: amqplib.Channel;

async function tryConnectRabbitMQ(): Promise<void> {
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
    console.error(`❌ Failed to connect RabbitMQ (attempt `, error);
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
