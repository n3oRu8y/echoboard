import express from "express";

import PageRoutes from "./PageRoutes.js";
import ApiRoutes from "./ApiRoutes.js";

const routes = express.Router();

routes.use("/", PageRoutes);
routes.use("/api", ApiRoutes);

export default routes;