import TurnstileService from "../../infrastructures/turnstile/TurnstileService.js";
import Attachment from "./AttachmentDomain.js";
import type AttachmentRepository from "./AttachmentRepository.js";

export default class AttachmentService {
    constructor(
        private repo: AttachmentRepository
    ) {}

    public async Create(authorId: string, fileUrl: string, isImage: boolean, fileName: string, fileType: string, size: number, token: string, ip: string, now: Date = new Date()) {
        await TurnstileService.Verify(token, ip);
        const attachment = Attachment.Create(authorId, fileUrl, fileName, isImage, fileType, size, now);
        return await this.repo.Create(attachment);
    }

    public async Get(attachmentId: string) {
        return await this.repo.FindById(attachmentId);
    }

    public async GetAttachments(attachmentIds: Array<string>) {
        return await this.repo.FindByIds(attachmentIds)
    }
}