import express from "express";

import PageRoutes from "./PageRoutes.js";
import ApiRoutes from "./ApiRoutes.js";

const routes = express.Router();

routes.use("/api", ApiRoutes);
routes.use("/", PageRoutes);

export default routes;