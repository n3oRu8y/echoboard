import express from "express";
import HomeController from "./HomeController.js";

const router = express.Router();

router.get("/", HomeController.HomePage);

export default router;