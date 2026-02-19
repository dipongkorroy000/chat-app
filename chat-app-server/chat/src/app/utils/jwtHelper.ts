import jwt from "jsonwebtoken";
import env from "../env";

export const generateToken = (email: string) => {
  return jwt.sign({email}, env.jwt_access_secret, {expiresIn: "15d"});
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwt_access_secret);
};
