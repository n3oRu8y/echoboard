import User from "../user/UserDomain.js";

class PostSummery {
    constructor(
        public id: number,
        public title: string,
        public author: User,
        public isAnonymous: boolean,
        public isNotice: boolean,
        public createdAt: Date
    ) {}

    public static FromRow(row: any) {
        return new PostSummery(
            row.id,
            row.title,
            User.FromRow(row.author),
            row.isAnonymous,
            row.isNotice,
            row.createdAt
        );
    }
}

export default class Board {
    constructor(
        public readonly id: number | null,
        public url: string,
        public name: string,
        public description: string | null,
        public readonly createdBy: string,
        public canRead: boolean,
        public canWrite: boolean,
        public isPrivate: boolean,
        public isNoticeBoard: boolean,
        public showHome: boolean,
        public showNavbar: boolean,
        public posts: PostSummery | null,
        public createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null
    ) {}

    public static Create(url: string, name: string, createdBy: string, createdAt: Date) {
        return new Board(
            null,
            url,
            name,
            null,
            createdBy,
            true,
            true,
            false,
            false,
            true,
            true,
            null,
            createdAt,
            createdAt,
            null
        );
    }

    public static FromRow(row: any) {
        return new Board(
            row.id,
            row.url,
            row.name,
            row.description,
            row.createdBy,
            row.canRead,
            row.canWrite,
            row.isPrivate,
            row.isNoticeBoard,
            row.showHome,
            row.showNavbar,
            row.posts ? row.posts.map((post: any) => PostSummery.FromRow(post)) : null,
            row.createdAt,
            row.updatedAt,
            row.deletedAt
        );
    }
}
