import express from "express";
import AuthController from "./AuthController.js";

const router = express.Router();

router.post("/login", AuthController.Login);
router.post("/logout", AuthController.Logout);
router.post("/register", AuthController.Register);

export default router;