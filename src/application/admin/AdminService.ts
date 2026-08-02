import prisma from "../../db/prisma.js";

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
}