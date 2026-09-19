import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

type ValidationTarget = "body" | "query" | "params";

export const validate = (schema: ZodType, target: ValidationTarget) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse(req[target]);
      req[target] = parsedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const validateBody = (schema: ZodType) => validate(schema, "body");
export const validateQuery = (schema: ZodType) => validate(schema, "query");
export const validateParams = (schema: ZodType) => validate(schema, "params");