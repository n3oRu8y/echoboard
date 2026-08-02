import express from "express";

import AuthRouter from "../domains/auth/AuthPageRouter.js";
import BoardRouter from "../domains/board/BoardPageRouter.js";
import HomeRouter from "../domains/home/HomeRouter.js";
import PostPageRouter from "../domains/post/PostPageRouter.js";
import UserPageRouter from "../domains/user/UserPageRouter.js";

const routes = express.Router();

routes.use("/", AuthRouter);
routes.use("/boards", BoardRouter);
routes.use("/", HomeRouter);
routes.use("/", PostPageRouter);
routes.use("/", UserPageRouter);

export default routes;