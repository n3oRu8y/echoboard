import type { Request, Response } from "express";
import AdminService from "./AdminService.js";

export default class AdminPageController {
    public static async AdminHomePage(req: Request, res: Response) {
        const stats = await AdminService.GetDashboardStats();
        return res.render("admin/index.ejs", { stats: stats });
    }
}