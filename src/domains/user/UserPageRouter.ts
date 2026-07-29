import express from "express";
import UserPageController from "./UserPageController.js";

const router = express.Router();

router.get("/mypage", UserPageController.MyPage);

export default router;