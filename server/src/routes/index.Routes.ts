import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { usersRouter } from "./users.routes.js";
import { doctorsRouter } from "./doctors.routes.js";
import { specialtiesRouter } from "./specialties.routes.js";
import { patientsRouter } from "./patients.routes.js";
import { appointmentsRouter } from "./appointments.routes.js";
import { consultationsRouter } from "./consultations.routes.js";
import { treatmentsRouter } from "./treatments.routes.js";
import { medicalFilesRouter } from "./medical_files.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { authenticateMiddleware } from "../middlewares/authenticate.middleware.js";

export const indexRouter: Router = Router();

indexRouter.use("/auth", authRouter);
indexRouter.use("/users", authenticateMiddleware, usersRouter);
indexRouter.use("/doctors", doctorsRouter);
indexRouter.use("/specialties", specialtiesRouter);
indexRouter.use("/patients", authenticateMiddleware, patientsRouter);
indexRouter.use("/appointments", authenticateMiddleware, appointmentsRouter);
indexRouter.use("/consultations", authenticateMiddleware, consultationsRouter);
indexRouter.use("/treatments", authenticateMiddleware, treatmentsRouter);
indexRouter.use("/medical-files", authenticateMiddleware, medicalFilesRouter);
indexRouter.use("/dashboard", authenticateMiddleware, dashboardRouter);
