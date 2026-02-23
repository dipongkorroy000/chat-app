import amqplib from "amqplib";
import env from "../env";
import nodemailer from "nodemailer";

async function connectConsumer(attempt = 1, maxAttempts = 3, delay = 2000) {
  try {
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

    const channel = await connection.createChannel();
    const queueName = "send-otp";

    await channel.assertQueue(queueName, {durable: true});
    console.log("✅ Mail service consumer started, listening for OTP emails");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const {to, subject, body} = JSON.parse(msg.content.toString());

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {user: env.nodemailer.user, pass: env.nodemailer.pass},
          });

          await transporter.sendMail({
            from: "Chat App",
            to,
            subject,
            text: body,
          });
          console.log(`OTP mail sent to ${to}`);

          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send OTP", error);
        }
      }
    });
  } catch (error) {
    console.error(`❌ Failed to start RabbitMQ consumer (attempt ${attempt})`, error);

    if (attempt < maxAttempts) {
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
      await new Promise((res) => setTimeout(res, delay));
      return connectConsumer(attempt + 1, maxAttempts, delay); // recursive retry
    } else {
      console.error("❌ All attempts to connect RabbitMQ consumer failed");
    }
  }
}

export const startSendOTPConsumer = async () => {
  await connectConsumer();
};
