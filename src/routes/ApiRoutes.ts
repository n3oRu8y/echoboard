import express from "express";

import AuthRouter from "../domains/auth/AuthRouter.js";

const routes = express.Router();

routes.use("/auth", AuthRouter);

export default routes;