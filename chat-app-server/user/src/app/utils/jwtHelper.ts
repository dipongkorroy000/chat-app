import jwt from "jsonwebtoken";
import env from "../env";
import {ObjectId, Types} from "mongoose";

export const generateToken = (_id: Types.ObjectId) => {
  return jwt.sign({_id}, env.jwt_access_secret, {expiresIn: "15d"});
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwt_access_secret);
};
