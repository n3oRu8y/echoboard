import express from "express";
import AuthController from "./AuthController.js";

const router = express.Router();

router.post("/login", AuthController.Login);

export default router;