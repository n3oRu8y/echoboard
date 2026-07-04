import express from "express";
import AuthPageController from "./AuthPageController.js";

const router = express.Router();

router.get("/login", AuthPageController.Login);

export default router;