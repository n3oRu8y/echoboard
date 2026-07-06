import type { Request, Response } from "express";
import UserService from "../user/UserService.js";
import UserRepo from "../user/UserRepository.js";
import BoardService from "./BoardService.js";
import BoardRepo from "./BoardRepository.js";
import { ConflictError } from "../../common/exceptions/ConflictError.js";
import BoardNotFound from "./exceptions/BoardNotFound.js";

export default class BoardController {
    public static async CreateBoard(req: Request, res: Response) {
        if (!req.session?.userId) {
            res.status(401).json({ status: "error", message: "로그인해주세요." });
        }

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session?.userId!);
        if (user.role != "ADMIN") {
            return res.status(403).json({ status: "error", message: "관리자만 게시판을 생성할 수 있습니다." });
        }

        const { url, name, description } = req.body;
        if (!url || !name) {
            return res.status(400).json({ status: "error", message: "필수 항목 누락" });
        }

        try {
            const boardService = new BoardService(new BoardRepo());
            const board = await boardService.Create(url, name, user.id!);

            if (description) {
                await boardService.SetDescription(board!.id!, description);
            }
        } catch (e) {
            if (e instanceof ConflictError) {
                return res.status(409).json({ status: "error", message: "게시판 주소가 중복됩니다." });
            }
        }

        return res.status(201).json({ status: "ok" });
    }

    public static async UpdateBoard(req: Request, res: Response) {
        if (!req.session?.userId) {
            return res.status(401).json({ status: "error", message: "로그인해주세요." });
        } 

        const userService = new UserService(new UserRepo());
        const user = await userService.GetUserWithUserId(req.session.userId);
        if (user.role != "ADMIN") {
            return res.status(403).json({ status: "error", message: "관리자가 아닙니다." });
        }

        const boardId = Number(req.params.boardId);

        if (!Number.isInteger(boardId) || boardId <= 0) {
            return res.status(404).json({ status: "error", message: "게시판을 찾을 수 없습니다." });
        }

        const { url, name, description, canRead, canWrite, isPrivate } = req.body;

        if (!url && !name && !description) {
            return res.status(400).json({ status: "error", message: "변경할 항목을 입력해주세요." });
        }

        try {
            const boardService = new BoardService(new BoardRepo());
            const board = await boardService.GetById(Number(boardId));

            if (url) {
                await boardService.ChangeUrl(board.id!, url);
            }

            if (name) {
                await boardService.ChangeName(board.id!, name);
            }

            if (description) {
                await boardService.SetDescription(board.id!, description);
            }

            if (
                canRead !== undefined ||
                canWrite !== undefined ||
                isPrivate !== undefined
            ) {
                await boardService.ChangePermission(board.id!, canRead, canWrite, isPrivate);
            }
        } catch (e) {
            if (e instanceof BoardNotFound) {
                return res.status(404).json({ status: "error", message: "게시판을 찾을 수 없습니다." });
            } else if (e instanceof ConflictError) {
                return res.status(409).json({ status: "error", message: "게시판 주소가 중복됩니다." });
            }
            throw e;
        }

        return res.status(201).json({ status: "ok" });
    }
}