import type { Request, Response, NextFunction } from "express";
import { findAdminMetrics, findDoctorMetrics } from "../services/admin.services.js";
import { BadRequestError } from "../utils/errors.js";

export const getAdminDashboardMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await findAdminMetrics();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getDoctorMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = req.user?.specificId;
    if (!doctorId) {
      throw new BadRequestError("Doctor profile ID not associated with current user");
    }
    const result = await findDoctorMetrics(doctorId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};