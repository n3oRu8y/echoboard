import express from "express";
import AttachmentController from "./AttachmentController.js";
import upload from "../../middlewares/Upload.js";

const router = express.Router();

router.get("/:attachmentId", AttachmentController.GetFile);

router.post("/image", upload.single("image"), AttachmentController.UploadImage);
router.post("/file", upload.single("file"), AttachmentController.UploadFile);

export default router;