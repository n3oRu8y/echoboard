import prisma from "../../db/prisma.js";
import Post from "./PostDomain.js";
import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";

export default class PostRepository {
    public async Create(post: Post, db: PrismaClient | Prisma.TransactionClient) {
        const row = await db.post.create({
            data: {
                title: post.title,
                content: post.content,
                isAnonymous: post.isAnonymous,
                authorId: post.authorId,
                boardId: post.boardId,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                deletedAt: post.deletedAt,
            },
        });
        return Post.FromRow(row);
    }

    public async FindById(id: number, withAuthor: boolean = false, withBoard: boolean = false, withAttachments: boolean = false, withReactions: boolean = false, withComment: boolean = true) {
        const row = await prisma.post.findFirst({
            where: {
                id: id,
                deletedAt: null,
            }, include: {
                author: withAuthor,
                board: withBoard,
                attachments: withAttachments,
                reactions: withReactions,
                ...(withComment && {
                    comments: {
                        include: {
                            author: true,
                            replies: {
                                include: {
                                    author: true
                                }
                            }
                        },
                        where: {
                            parent: null
                        }
                    }
                })
            }
        });
        return row ? Post.FromRow(row) : null;
    }

    public async FindByBoardId(boardId: number, limit: number = 10, offset: number = 10, query: string | null): Promise<Array<Post>> {
        const rows = await prisma.post.findMany({
            take: limit,
            skip: offset,
            where: {
                boardId: boardId,
                deletedAt: null,
                ...(query && {
                    OR: [
                            {
                                content: {
                                    contains: query
                                },
                            },
                            {
                                    title: {
                                    contains: query
                                }
                            }
                    ]
                })
            },
            include: {
                author: true
            },
            orderBy: {
                id: "desc",
            }
        });
        
        const result: Array<Post> = [];
        for (const row of rows) {
            result.push(Post.FromRow(row));
        }

        return result;
    }

    public async FetchPostCount(boardId: number) {
        const result = await prisma.post.count({
            where: {
                deletedAt: null,
                boardId: boardId
            }
        });

        return result;
    }

    public async Update(postId: number, post: Post, db: PrismaClient | Prisma.TransactionClient = prisma) {
        await db.post.update({
            data: {
                title: post.title,
                content: post.content,
                deletedAt: post.deletedAt
            },
            where: {
                id: postId
            }
        });
    }
}