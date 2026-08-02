import express from "express";
import UserPageController from "./UserPageController.js";

const router = express.Router();

router.get("/mypage", UserPageController.MyPage);
router.get("/mypage/nickname", UserPageController.Nickname);
router.get("/mypage/password", UserPageController.Password);
router.get("/mypage/2fa", UserPageController.TwoFactorRegister);
router.get("/mypage/posts", UserPageController.GetMyPosts);
router.get("/mypage/withdraw", UserPageController.WithdrawPage);

export default router;