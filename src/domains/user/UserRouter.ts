import express from "express";
import UserControler from "./UserController.js";

const router = express.Router();

router.delete("/users/:userId", UserControler.DeleteUser);

router.patch("/users/:userId", UserControler.Update);

export default router;