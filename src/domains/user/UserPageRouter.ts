import express from "express";
import UserPageController from "./UserPageController.js";

const router = express.Router();

router.get("/mypage", UserPageController.MyPage);
router.get("/mypage/nickname", UserPageController.Nickname);

export default router;