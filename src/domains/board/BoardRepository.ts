import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import prisma from "../../db/prisma.js";
import Board from "./BoardDomain.js";
import { ConflictError } from "../../common/exceptions/ConflictError.js";

export default class BoardRepo {
    public async Create(board: Board) {
        try {
            const saved = await prisma.board.create({
                data: {
                    url: board.url,
                    name: board.name,
                    createdBy: board.createdBy,
                    createdAt: board.createdAt
                }
            });
            return Board.FromRow(saved);
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                if (e.code == "P2002") {
                    const target = e.meta?.target as Array<string>[0];
                    throw new ConflictError(target);
                }
                throw e;
            }
        }
    }

    public async Update(boardId: number, board: Board) {
        try {
            await prisma.board.update({
                data: {
                    url: board.url,
                    name: board.name,
                    description: board.description,
                    createdBy: board.createdBy,
                    canRead: board.canRead,
                    canWrite: board.canWrite,
                    isPrivate: board.isPrivate,
                    createdAt:  board.createdAt,
                    updatedAt: board.updatedAt,
                    deletedAt: board.deletedAt
                },
                where: {
                    id: boardId,
                    deletedAt: null
                }
            });
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                const target = e.meta?.target as Array<string>[0];
                throw new ConflictError(target);
            }
            throw e;
        }
    }

    public async FetchAll(withPost: boolean = false, withPrivateBoard: boolean = false) {
        const rows = await prisma.board.findMany({
            where: {
                deletedAt: null,
                ...(!withPrivateBoard && {
                    canRead: true,
                    canWrite: true,
                    isPrivate: false
                })
            },
            orderBy: {
                name: "asc"
            },
            ...(withPost && {
                include: {
                    posts: {
                        take: 10,
                        include: {
                            author: true
                        },
                        where: {
                            deletedAt: null
                        }
                    }
                }
            })
        });
        const result = [];
        for (const row of rows) {
            result.push(Board.FromRow(row));
        }
        return result;
    }

    public async FindById(boardId: number) {
        const row = await prisma.board.findUnique({
            where: {
                id: boardId,
                deletedAt: null
            }
        });
        return row ? Board.FromRow(row) : null;
    }

    public async FindByUrl(url: string): Promise<Board | null> {
        const row = await prisma.board.findUnique({
            where: {
                url: url,
                deletedAt: null
            }
        });
        return row ? Board.FromRow(row) : null;
    }
}