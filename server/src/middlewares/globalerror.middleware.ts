import type { Request, Response, NextFunction } from "express"

const globalErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Internal Error",
  })
};

export default globalErrorMiddleware;