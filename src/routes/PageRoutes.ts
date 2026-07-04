import express from "express";

import AuthRouter from "../domains/auth/AuthPageRouter.js";

const routes = express.Router();

routes.use("/", AuthRouter);

export default routes;