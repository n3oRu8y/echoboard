import prisma from "../../db/prisma.js";

export default class ViewService {
    public static async GetNavbarBoards() {
        return await prisma.board.findMany({
            where: {
                showNavbar: true,
                deletedAt: null
            },
            orderBy: {
                name: "asc"
            }
        });
    }
}