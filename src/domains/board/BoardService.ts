import Board from "./BoardDomain.js";
import type BoardRepo from "./BoardRepository.js";
import BoardNotFound from "./exceptions/BoardNotFound.js";

export default class BoardService {
    constructor(
        private repo: BoardRepo
    ) {}

    public async Create(url: string, name: string, createdBy: string, now: Date = new Date()) {
        const board = Board.Create(url, name, createdBy, now);
        return await this.repo.Create(board);
    }

    public async GetAll() {
        return await this.repo.FetchAll();
    }

    public async GetById(id: number) {
        const board = await this.repo.FindById(id);
        if (!board) {
            throw new BoardNotFound(`Could not find a board with the url ${id}.`);
        }
        return board
    }

    public async GetByUrl(url: string) {
        const board = await this.repo.FindByUrl(url);
        if (!board) {
            throw new BoardNotFound(`Could not find a board with the url ${url}.`);
        }
        return board;
    }

    public async ChangeUrl(boardId: number, url: string) {
        const board = await this.repo.FindById(boardId);
        if (!board) {
            throw new BoardNotFound(`Could not find a board with the id ${boardId}.`);
        }
        board.url = url;
        await this.repo.Update(boardId, board);
    }

    public async ChangeName(boardId: number, name: string) {
        const board = await this.repo.FindById(boardId);
        if (!board) {
            throw new BoardNotFound(`Could not find a board with the id ${boardId}.`);
        }
        board.name = name;
        await this.repo.Update(boardId, board);
    }

    public async ChangePermission(boardId: number, canRead: boolean | null, canWrite: boolean | null, isPrivate: boolean | null) {
        const board = await this.repo.FindById(boardId);
        if (!board) {
            throw new BoardNotFound(`Could not find a board with the id ${boardId}.`);
        }

        if (canRead) {
            board.canRead = canRead;
        }

        if (canWrite) {
            board.canWrite = canWrite;
        }

        if (isPrivate) {
            board.isPrivate = isPrivate;
        }

        await this.repo.Update(boardId, board);
    }

    public async SetDescription(boardId: number, description: string) {
        const board = await this.repo.FindById(boardId);
        if (!board) {
            throw new BoardNotFound(`Could not find a board with the id ${boardId}.`);
        }
        board.description = description;
        await this.repo.Update(boardId, board);
    }
}