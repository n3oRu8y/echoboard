import express from "express";

import AuthRouter from "../domains/auth/AuthPageRouter.js";
import BoardRouter from "../domains/board/BoardPageRouter.js";
import PostPageRouter from "../domains/post/PostPageRouter.js";
import UserPageRouter from "../domains/user/UserPageRouter.js";

const routes = express.Router();

routes.use("/", AuthRouter);
routes.use("/", BoardRouter);
routes.use("/", PostPageRouter);
routes.use("/", UserPageRouter);

export default routes;