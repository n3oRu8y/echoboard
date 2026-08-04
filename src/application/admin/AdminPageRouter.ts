import express from "express";
import AdminPageController from "./AdminPageController.js";
import AdminCheck from "../../middlewares/AdminCheck.js";

const router = express.Router();

router.use(AdminCheck);

router.get("/", AdminPageController.AdminHomePage);
router.get("/boards", AdminPageController.SetBoardPage);
router.get("/users", AdminPageController.UserListPage);
router.get("/users/:userId", AdminPageController.UserDetailPage);

export default router;