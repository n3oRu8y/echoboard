import Reaction from "./ReactionDomain.js";
import type { TransactionClient } from "../../generated/prisma/internal/prismaNamespace.js";
import prisma from "../../db/prisma.js";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { ConflictError } from "../../common/exceptions/ConflictError.js";

export default class ReactionRepository {
    public async Create(reaction: Reaction, db: PrismaClient | TransactionClient = prisma): Promise<Reaction> {
        try {
            const row = await db.postReaction.create({
                data: {
                    userId: reaction.userId,
                    postId: reaction.postId,
                    createdAt: reaction.createdAt,
                    type: reaction.type
                }
            });
            return new Reaction(
                row.id,
                row.userId,
                null,
                row.postId,
                null,
                row.type,
                row.createdAt,
                row.updatedAt
            )
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code == "P2002") {
                    throw new ConflictError(`A reaction from user ${reaction.userId} to post ${reaction.postId} already exists.`);
                }
            }
            throw e;
        }
    }

    public async Delete(id: number, db: PrismaClient | TransactionClient = prisma): Promise<void> {
        await db.postReaction.delete({
            where: {
                id: id
            }
        });
    }

    public async FindById(id: number, db: PrismaClient | TransactionClient = prisma): Promise<Reaction | null> {
        const row = await db.postReaction.findUnique({
            where: {
                id: id
            }
        });
        return row ? Reaction.FromRow(row) : null;
    } 

    public async FetchReactionsFromPost(postId: number, db: PrismaClient | TransactionClient = prisma): Promise<Array<Reaction>> {
        const rows = await db.postReaction.findMany({
            where: {
                postId: postId
            }
        });
        return rows.map(row => Reaction.FromRow(row));
    } 

    public async FindByUserIdAndPostId(userId: string, postId: number, db: PrismaClient | TransactionClient = prisma): Promise<Reaction | null> {
        const row = await db.postReaction.findUnique({
            where: {
                userId_postId: { userId, postId }
            }
        });
        return row ? Reaction.FromRow(row) : null;
    }
};