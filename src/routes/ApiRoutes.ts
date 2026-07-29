import express from "express";

import AttachmentRouter from "../domains/attachment/AttachmentRouter.js";
import AuthRouter from "../domains/auth/AuthRouter.js";
import BoardRouter from "../domains/board/BoardRouter.js";
import PostRouter from "../domains/post/PostRouter.js";
import CommentRouter from "../domains/comment/CommentRouter.js";

import InternalServerError from "../middlewares/InternalServerError.js";
import NotFound from "../middlewares/NotFound.js";

const routes = express.Router();

routes.use("/attachments", AttachmentRouter);
routes.use("/auth", AuthRouter);
routes.use("/boards", BoardRouter);
routes.use("/", PostRouter);
routes.use("/", CommentRouter);

routes.use(InternalServerError);
routes.use(NotFound);

export default routes;