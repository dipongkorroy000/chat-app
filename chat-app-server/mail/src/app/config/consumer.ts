import amqplib from "amqplib";
import env from "../env";
import nodemailer from "nodemailer";

export const startSendOTPConsumer = async () => {
  try {
    const connection = await amqplib.connect({
      protocol: "amqp",
      hostname: env.rabbitMQ.hostname,
      port: Number(env.rabbitMQ.port),
      username: env.rabbitMQ.username,
      password: env.rabbitMQ.password,
    });
    connection.on("error", (err) => {
      console.error("❌ User RabbitMQ connection error:", err);
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
          console.log(`OPT mail send to ${to}`);

          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send OTP", error);
        }
      }
    });
  } catch (error) {
    console.log("❌ Mail Failed to start rabbitMQ consumer");
  }
};
