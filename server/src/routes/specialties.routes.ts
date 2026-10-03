import { Router } from "express";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { SpecialtySchema, SpecialtyUpdateSchema } from "../schemas/specialties.schema.js";
import { ParamsIdSchema } from "../schemas/request.schema.js";
import { authenticateMiddleware } from "../middlewares/authenticate.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import {
  getAllSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "../controllers/specialties.controllers.js";

export const specialtiesRouter: Router = Router();

specialtiesRouter.get("/", getAllSpecialties);
specialtiesRouter.get("/:id", validateParams(ParamsIdSchema), getSpecialtyById);
specialtiesRouter.post("/", authenticateMiddleware, authorizeRoles("admin"), validateBody(SpecialtySchema), createSpecialty);
specialtiesRouter.put("/:id", authenticateMiddleware, authorizeRoles("admin"), validateParams(ParamsIdSchema), validateBody(SpecialtyUpdateSchema), updateSpecialty);
specialtiesRouter.delete("/:id", authenticateMiddleware, authorizeRoles("admin"), validateParams(ParamsIdSchema), deleteSpecialty);
