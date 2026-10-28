import { Router } from "express";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { getAdminDashboardMetrics, getDoctorMetrics } from "../controllers/admin.controllers.js";

export const dashboardRouter: Router = Router();

dashboardRouter.get("/admin", authorizeRoles("admin"), getAdminDashboardMetrics);
dashboardRouter.get("/doctor", authorizeRoles("doctor"), getDoctorMetrics);
