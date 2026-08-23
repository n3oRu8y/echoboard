import type { Request, Response } from "express";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import FileService from "../file/FileService.js";
import { LocalFileStorage } from "../../infrastructures/storage/LocalFileStorage.js";
import AttachmentService from "./AttachmentService.js";
import AttachmentRepository from "./AttachmentRepository.js";
import TurnstileFailed from "../../infrastructures/turnstile/exceptions/TurnstileFailed.js";

const SAFE_INLINE_IMAGE_TYPES = new Set([
    "image/avif",
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/x-icon"
]);

export default class AttachmentController {
    public static async UploadFile(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const token = req.body.token as string;
        const ip = req.ip!;
        if (!token) {
            return res.status(400).json({ status: "error", message: "Turnstile 토큰이 입력되지 않았습니다." });
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId, true);
        if (!user) {
            return res.status(403).json({ status: "error", message: "유효하지 않은 세션 정보입니다." });
        }

        if (user.IsBanned()) {
            return res.status(403).json({ status: "error", message: "차단된 사용자입니다." });
        }

        const file = req.file as Express.Multer.File;
        if (!file) {
            return res.status(400).json({ status: "error", message: "파일이 없습니다." });
        }
        file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");

        const fileService = new FileService(new LocalFileStorage());
        if (file.size > 50 * 1024 * 1024) {
            return res.status(400).json({ status: "error", message: "파일이 너무 큽니다." });
        }

        const saved = await fileService.Save(file, "attachments");

        const attachmentService = new AttachmentService(new AttachmentRepository());

        let attachment = null;
        try {
            attachment = await attachmentService.Create(user.id!, saved.storedName, false, saved.originalName, saved.mimeType, saved.size, token, ip);
        } catch (e) {
            if (e instanceof TurnstileFailed) {
                return res.status(403).json({ status: "error", message: "보안 작업을 실패했습니다." });
            }
            throw e;
        }

        return res.status(201).json({ 
            status: "ok",
            data: {
                id: attachment.id,
                originalName: attachment.fileName,
                url: `/api/attachments/${attachment.id}`,
                size: saved.size
            } 
        });
    }
    
    public static async UploadImage(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const token = req.body.token as string;
        const ip = req.ip!;
        if (!token) {
            return res.status(400).json({ status: "error", message: "Turnstile 토큰이 입력되지 않았습니다." });
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId, true);
        if (!user) {
            return res.status(403).json({ status: "error", message: "유효하지 않은 세션 정보입니다." });
        }

        if (user.IsBanned()) {
            return res.status(403).json({ status: "error", message: "차단된 사용자입니다." });
        }

        if (!req.file) {
            return res.status(400).json({ status: "error", message: "파일이 없습니다." });
        }

        const imageType = req.file.mimetype.toLowerCase();
        if (!SAFE_INLINE_IMAGE_TYPES.has(imageType)) {
            return res.status(400).json({ status: "error", message: "지원하지 않는 이미지 형식입니다." });
        }

        const fileService = new FileService(new LocalFileStorage());
        if (req.file.size > 50 * 1024 * 1024) {
            return res.status(400).json({ status: "error", message: "파일이 너무 큽니다." });
        }

        const saved = await fileService.Save(req.file, "attachments");

        const attachmentService = new AttachmentService(new AttachmentRepository());
        let fileInfo = null;
        try {
            fileInfo = await attachmentService.Create(user.id!, saved.storedName, true, saved.originalName, saved.mimeType, saved.size, token, ip);
        } catch (e) {
            if (e instanceof TurnstileFailed) {
                return res.status(403).json({ status: "error", message: "보안 작업을 실패했습니다." });
            }
            throw e;
        }

        return res.status(201).json({ 
            status: "ok", 
            data: {
                id: fileInfo.id,
                originalName: fileInfo.fileName,
                url: `/api/attachments/${fileInfo.id}`,
                size: saved.size
            }
        });
    }

    public static async GetFile(req: Request, res: Response) {
        const attachmentId = req.params.attachmentId as string;

        const attachmentService = new AttachmentService(new AttachmentRepository());
        const attachment = await attachmentService.Get(attachmentId);
        if (!attachment) {
            return res.status(404).json({ status: "error", message: "File not found." });
        }

        const fileService = new FileService(new LocalFileStorage);
        const file = await fileService.Read(`uploads/attachments/${attachment.fileUrl}`, true);
        if (!file) {
            return res.status(404).json({ status: "error", message: "File not found" });
        }

        const filename = attachment.fileName.normalize("NFC");
        const encoded = encodeURIComponent(filename);
        
        const fileType = attachment.fileType.toLowerCase();
        const canRenderInline = attachment.isImage && SAFE_INLINE_IMAGE_TYPES.has(fileType);

        res.setHeader(
            "Content-Disposition",
            `${canRenderInline ? "inline" : "attachment"}; filename*=UTF-8''${encoded}`
        );
        res.setHeader("Content-Type", canRenderInline ? fileType : "application/octet-stream");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");

        return res.status(200).send(file);
    }
}
