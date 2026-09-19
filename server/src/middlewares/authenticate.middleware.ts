import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
import type { JwtPayloadType } from "../schemas/auth.schema.js";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayloadType;
    }
  }
}

export const authenticateMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined = req.cookies?.token;

    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (match && match[1]) {
        token = match[1];
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid or missing token" });
    }

    const decodedToken = jwt.verify(token, env.JWT_SECRET as string) as JwtPayloadType;
    req.user = decodedToken;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
  }
};
