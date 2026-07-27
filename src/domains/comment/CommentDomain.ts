import User from "../user/UserDomain.js";

export default class Comment {
    public displayNick: string;

    constructor(
        public id: number | null,
        public authorId: string,
        public author: User | null,
        public isAnonymous: boolean,
        public content: string,
        public postId: number,
        public parentId: number | null,
        public parent: Comment | null,
        public replies: Array<Comment> | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public deletedAt: Date | null
    ) {
        this.displayNick = author?.nickname as string;
    }

    public static FromRow(row: any): Comment {
        return new Comment(
            row.id,
            row.authorId,
            row.author ? User.FromRow(row.author) : null,
            row.isAnonymous,
            row.content,
            row.postId,
            row.parentId,
            row.parent ? Comment.FromRow(row.parent) : null,
            row.replies? row.replies.map((reply: any) => Comment.FromRow(reply)) : null,
            row.createdAt,
            row.updatedAt,
            row.deletedAt
        );
    }
}