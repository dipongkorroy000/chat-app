import amqplib from "amqplib";
import env from "../env";

let channel: amqplib.Channel; // Capital C in Channel

export const connectRabbitMQ = async () => {
  try {
    if (!env.rabbitMQ.hostname || !env.rabbitMQ.port || !env.rabbitMQ.username || !env.rabbitMQ.password) throw Error("❌ Env to rabbitMQ");

    const connection = await amqplib.connect({
      protocol: "amqp",
      hostname: env.rabbitMQ.hostname,
      port: Number(env.rabbitMQ.port), // Convert to number!
      username: env.rabbitMQ.username,
      password: env.rabbitMQ.password,
    });
    connection.on("error", (err) => {
      console.error("❌ User RabbitMQ connection error:", err);
    });

    channel = await connection.createChannel();

    console.log("✅ User Connected to rabbitMQ");
  } catch (error) {
    console.log("❌ User Failed to connect rabbitMQ", error);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("RabbitMq channel is not initialized");
    return;
  }

  await channel.assertQueue(queueName, {durable: true});

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {persistent: true});
};
