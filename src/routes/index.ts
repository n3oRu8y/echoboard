import express from "express";

import SetupRouter from "./SetupRouter.js";
import PageRoutes from "./PageRoutes.js";
import ApiRoutes from "./ApiRoutes.js";

const routes = express.Router();

routes.use("/setup", SetupRouter);
routes.use("/api", ApiRoutes);
routes.use("/", PageRoutes);

export default routes;