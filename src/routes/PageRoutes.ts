import express from "express";

import AuthRouter from "../domains/auth/AuthPageRouter.js";
import BoardRouter from "../domains/board/BoardPageRouter.js";
import HomeRouter from "../domains/home/HomeRouter.js";
import PostPageRouter from "../domains/post/PostPageRouter.js";

import PageError from "../middlewares/PageError.js";
import PageNotFound from "../middlewares/PageNotFound.js";

const routes = express.Router();

routes.use("/", AuthRouter);
routes.use("/boards", BoardRouter);
routes.use("/", HomeRouter);
routes.use("/", PostPageRouter);

routes.use(PageError);
routes.use(PageNotFound);

export default routes;