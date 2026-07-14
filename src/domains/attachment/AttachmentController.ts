import type { Request, Response } from "express";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import FileService from "../file/FileService.js";
import { LocalFileStorage } from "../../infrastructures/storage/LocalFileStorage.js";
import AttachmentService from "./AttachmentService.js";
import AttachmentRepository from "./AttachmentRepository.js";

export default class AttachmentController {
    public static async UploadFile(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
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
        const attachment = await attachmentService.Create(user.id!, saved.storedName, false, saved.originalName, saved.mimeType, saved.size);

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

        const fileService = new FileService(new LocalFileStorage());
        if (req.file.size > 50 * 1024 * 1024) {
            return res.status(400).json({ status: "error", message: "파일이 너무 큽니다." });
        }

        const saved = await fileService.Save(req.file, "attachments");

        const attachmentService = new AttachmentService(new AttachmentRepository());
        const fileInfo = await attachmentService.Create(user.id!, saved.storedName, true, saved.originalName, saved.mimeType, saved.size);

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
        
        if (attachment.fileType.toLowerCase().startsWith("image") || attachment.fileType.toLocaleLowerCase().startsWith("media"))
            res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encoded}"`);
        else
           res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encoded}`);

        res.setHeader("Content-Type", attachment.fileType);
        res.setHeader("X-Content-Type-Options", "nosniff");

        return res.status(200).send(file);
    }
}