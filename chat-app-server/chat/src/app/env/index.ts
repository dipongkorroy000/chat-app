import dotenv from "dotenv";
import path from "path";

dotenv.config({path: path.join((process.cwd(), ".env"))});

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DB_URL,
  frontend_url: process.env.FRONTEND_URL,

  redis_url: process.env.REDIS_URL,

  user_service_url: process.env.USER_SERVICE || "http://user-service:5001/api/v1",

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
  },
};
