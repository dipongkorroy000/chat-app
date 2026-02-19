import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.join((process.cwd(), ".env"))});

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DB_URL,

  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUND,

  redis_url: process.env.REDIS_URL,

  // config file
  rabbitMQ: {
    port: Number(process.env.RABBIT_PORT) || 5672, // Convert to number with fallback
    hostname: process.env.HOSTNAME || "localhost",
    username: process.env.USERNAME || "admin",
    password: process.env.PASSWORD || "admin",
  },

  user_service_url: process.env.USER_SERVICE || "http://user-service:5001/api/v1",

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  },
};
