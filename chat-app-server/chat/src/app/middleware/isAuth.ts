import {NextFunction, Request, Response} from "express";
import {verifyToken} from "../utils/jwtHelper";
import type {JwtPayload} from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  token?: JwtPayload | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({message: "Please Login - No auth header"});
      return;
    }

    const token = authHeader.split(" ")[1];

    const decodedToken = verifyToken(token as string) as JwtPayload;

    if (!decodedToken || !decodedToken._id) {
      res.status(401).json({message: "Invalid Token"});
      return;
    }

    req.token = decodedToken as JwtPayload;

    next();
  } catch (error) {
    res.status(401).json({message: "Please Login - JWT error"});
  }
};
