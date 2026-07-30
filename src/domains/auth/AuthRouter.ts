import express from "express";
import AuthController from "./AuthController.js";

const router = express.Router();

router.post("/login", AuthController.Login);
router.post("/login/2fa", AuthController.LoginWithTOTP);
router.post("/logout", AuthController.Logout);
router.post("/register", AuthController.Register);
router.post("/2fa/enable", AuthController.Enable2fa);
router.post("/2fa/disable", AuthController.Disable2fa);

export default router;