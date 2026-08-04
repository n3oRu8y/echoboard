import prisma from "../../db/prisma.js";
import User from "../../domains/user/UserDomain.js";

export default class AdminService {
    public static async GetDashboardStats() {
        const [ userCount, postCount, commentCount, boardCount ] = await Promise.all([
            prisma.user.count({
                where: {
                    deletedAt: null
                }
            }),

            prisma.post.count({
                where: {
                    deletedAt: null
                }
            }),

            prisma.comment.count({
                where: {
                    deletedAt: null
                }
            }),

            prisma.board.count({
                where: {
                    deletedAt: null
                }
            })
        ]);

        return {
            userCount,
            postCount,
            commentCount,
            boardCount
        };
    }

    public static async GetUserList(query: string, limit: number, offset: number) {
        const rows = await prisma.user.findMany({
            where: {
                deletedAt: null,
                ...(query && {
                    OR: [
                        {
                            username: {
                                contains: query
                            }
                        },
                        {
                            nickname: {
                                contains: query
                            }
                        },
                        {
                            email: {
                                contains: query
                            }
                        }
                    ]
                })
            },
            orderBy: {
                createdAt: "asc"
            },
            skip: offset,
            take: limit
        });
        return rows.map(row => User.FromRow(row));
    }

    public static async GetUserCount(query: string) {
        const count = await prisma.user.count({
            where: {
                deletedAt: null,
                ...(query && {
                    OR: [
                        {
                            username: {
                                contains: query
                            }
                        },
                        {
                            nickname: {
                                contains: query
                            }
                        },
                        {
                            email: {
                                contains: query
                            }
                        }
                    ]
                })
            },
        });
        return count / 10  + 1;
    }
}