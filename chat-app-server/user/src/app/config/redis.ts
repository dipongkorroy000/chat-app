import {createClient, type RedisClientType} from "redis";
import env from "../env";

export const redisClient: RedisClientType = createClient({
  url: env.redis_url,
});

export const connectRedis = async () => {
  redisClient.on("error", (err) => {
    console.error("❌ User Redis Client Error:", err);
  });

  redisClient.on("connect", () => {
    console.log("✅ User Redis Client Connected");
  });

  await redisClient.connect();
};
