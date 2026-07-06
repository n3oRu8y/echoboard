import express from "express";
import AuthPageController from "./AuthPageController.js";

const router = express.Router();

router.get("/login", AuthPageController.Login);
router.get("/register", AuthPageController.Register);

export default router;