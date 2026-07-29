import prisma from "../../db/prisma.js";
import Comment from "./CommentDomain.js";

export default class CommentRepository {
    public async Create(comment: Comment) {
        const saved = await prisma.comment.create({
            data: {
                authorId: comment.authorId,
                isAnonymous: comment.isAnonymous,
                content: comment.content,
                postId: comment.postId,
                parentId: comment.parentId,
                createdAt: comment.createdAt,
                deletedAt: comment.deletedAt
            }
        });
        return Comment.FromRow(saved);
    }

    public async Update(commentId: number, comment: Comment) {
        const row = await prisma.comment.update({
            data: {
                content: comment.content,
                deletedAt: comment.deletedAt
            }, where : {
                id: commentId
            }
        });
        return Comment.FromRow(row);
    }

    public async FindById(commentId: number) {
        const row = await prisma.comment.findUnique({
            where: {
                id: commentId
            }
        });
        return row ? Comment.FromRow(row) : null;
    }
}