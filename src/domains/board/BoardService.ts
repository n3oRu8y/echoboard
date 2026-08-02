import Board from "./BoardDomain.js";
import type BoardRepo from "./BoardRepository.js";
import BoardNotFound from "./exceptions/BoardNotFound.js";

export default class BoardService {
    constructor(
        private repo: BoardRepo
    ) {}

    public async Create(
        url: string,
        name: string,
        description: string,
        createdBy: string,
        canRead: boolean = true,
        canWrite: boolean = true,
        isPrivate: boolean = false,
        showHome: boolean,
        showNavbar: boolean,
        now: Date = new Date()
    ): Promise<Board> {
        const board = Board.Create(url, name, createdBy, now);

        board.description = description;
        board.canRead = canRead;
        board.canWrite = canWrite;
        board.isPrivate = isPrivate;
        board.showHome = showHome;
        board.showNavbar = showNavbar;

        return await this.repo.Create(board);
    }

    public async GetAll(withPost: boolean = false, withoutPrivateBoard: boolean = false, ignoreHomeVisibility: boolean = true) {
        return await this.repo.FetchAll(withPost, withoutPrivateBoard, ignoreHomeVisibility);
    }

    public async GetById(id: number): Promise<Board>;
    public async GetById(id: number, silent: false): Promise<Board>;
    public async GetById(id: number, silent: true): Promise<Board | null>;

    public async GetById(id: number, silent = false): Promise<Board | null> {
        const board = await this.repo.FindById(id);

        if (!board) {
            if (silent) {
                return null;
            }

            throw new BoardNotFound(`Could not find a board with the id ${id}.`);
        }

        return board;
    }

    public async GetByUrl(url: string): Promise<Board>;
    public async GetByUrl(url: string, silent: false): Promise<Board>
    public async GetByUrl(url: string, silent: true): Promise<Board | null>

    public async GetByUrl(url: string, silent: boolean = false): Promise<Board | null> {
        const board = await this.repo.FindByUrl(url);
        if (!board && !silent) {
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

        if (canRead != undefined) {
            board.canRead = canRead;
        }

        if (canWrite != undefined) {
            board.canWrite = canWrite;
        }

        if (isPrivate != undefined) {
            board.isPrivate = isPrivate;
        }

        await this.repo.Update(boardId, board);
    }

    public async UpdateVisibility(boardId: number, showHome: boolean, showNavbar: boolean) {
        const board = await this.repo.FindById(boardId);
        if (!board) {
            throw new BoardNotFound(`Could not find a board with the id ${boardId}.`);
        }

        if (showHome != undefined) {
            board.showHome = showHome;
        }

        if (showNavbar != undefined) {
            board.showNavbar = showNavbar;
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

    public async Delete(boardId: number) {
        const board = await this.repo.FindById(boardId);
        if (!board) {
            throw new BoardNotFound(`Could not find a board with the id ${boardId}.`);
        }
        const now = new Date();
        board.deletedAt = now;
        await this.repo.Update(boardId, board);
    }
}