import { Router } from "express";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { UserStatusSchema, UserQuerySchema } from "../schemas/users.schema.js";
import { ParamsIdSchema } from "../schemas/request.schema.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
} from "../controllers/users.controllers.js";

export const usersRouter: Router = Router();

usersRouter.get("/", authorizeRoles("admin"), validateQuery(UserQuerySchema), getAllUsers);
usersRouter.get("/:id", authorizeRoles("admin"), validateParams(ParamsIdSchema), getUserById);
usersRouter.patch("/:id/status", authorizeRoles("admin"), validateParams(ParamsIdSchema), validateBody(UserStatusSchema), updateUserStatus);
