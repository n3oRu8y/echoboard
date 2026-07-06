import express from "express";

import AuthRouter from "../domains/auth/AuthRouter.js";
import BoardRouter from "../domains/board/BoardRouter.js";

import InternalServerError from "../middlewares/InternalServerError.js";
import NotFound from "../middlewares/NotFound.js";

const routes = express.Router();

routes.use("/auth", AuthRouter);
routes.use("/boards", BoardRouter);

routes.use(InternalServerError);
routes.use(NotFound);

export default routes;