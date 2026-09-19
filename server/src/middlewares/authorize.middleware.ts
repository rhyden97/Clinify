import type { Request, Response, NextFunction } from "express";

type Role = "admin" | "doctor" | "patient";

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => { 
    const data = req.user
    if (!data) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user data found" });
    }
    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ success: false, message: "Forbidden: You do not have the required role" });
    }
    next();
  }    
}