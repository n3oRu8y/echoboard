import express from "express";
import PostPageController from "./PostPageController.js";

const router = express.Router();

router.get("/boards/:boardUrl/write", PostPageController.Write);
router.get("/boards/:boardUrl/:postId", PostPageController.ReadPost);
router.get("/boards/:boardUrl/:postId/edit", PostPageController.Update)

export default router;