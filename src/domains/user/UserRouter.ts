import express from "express";
import UserControler from "./UserController.js";

const router = express.Router();

router.patch("/users/:userId", UserControler.Update);

export default router;