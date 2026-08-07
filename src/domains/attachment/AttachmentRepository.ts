import prisma from "../../db/prisma.js";
import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import Attachment from "./AttachmentDomain.js";

export default class AttachmentRepository {
    public async Create(attachment: Attachment) {
        const row = await prisma.attachment.create({
            data: {
                postId: attachment.postId,
                authorId: attachment.authorId,
                isImage: attachment.isImage,
                fileName: attachment.fileName,
                fileUrl: attachment.fileUrl,
                fileType: attachment.fileType,
                size: attachment.size,
                createdAt: attachment.createdAt
            }
        });
        return Attachment.FromRow(row);
    }

    public async FindById(attachmentId: string) {
        const row = await prisma.attachment.findUnique({
            where: {
                id: attachmentId,
                deletedAt: null
            }
        });
        return row ? Attachment.FromRow(row) : null;
    }

    public async SetPostAttachments(postId: number, authorId: string, attachmentIds: Array<string>, db: PrismaClient | Prisma.TransactionClient = prisma) {
        await db.attachment.updateMany({
            data: {
                postId: null
            },
            where : {
                postId: postId,
                authorId: authorId
            }
        });

        await db.attachment.updateMany({
            data: {
                postId: postId
            },
            where: {
                id: {
                    in: attachmentIds,
                },
                authorId: authorId,
                postId: null
            }
        });
    }

    public async FindByIds(attachmentIds: Array<string>): Promise<Array<Attachment>> {
        const rows = await prisma.attachment.findMany({
            where: {
                id: {
                    in: attachmentIds
                }
            }
        });

        const result = [];
        for(const row of rows)
            result.push(Attachment.FromRow(row));
        return result;
    }

    public async Update(attachmentId: string, attachment: Attachment, db: PrismaClient | Prisma.TransactionClient = prisma) {
        await db.attachment.update({
            data: {
                postId: attachment.postId,
                deletedAt: attachment.deletedAt
            },
            where: {
                id: attachmentId
            }
        });
    }
}
