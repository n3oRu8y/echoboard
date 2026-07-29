import Attachment from "../attachment/AttachmentDomain.js";
import Board from "../board/BoardDomain.js";
import Comment from "../comment/CommentDomain.js";
import User from "../user/UserDomain.js";

export default class Post {
    constructor(
        public id: number | null,
        public title: string,
        public content: string,
        public isAnonymous: boolean,

        public comments: Array<Comment>,
        
        public authorId: string,
        public author: User | null,
        
        public boardId: number,
        public board: Board | null,
        
        public attachments: Array<Attachment> | null,
        public reactions: Array<null> | null, // 나중에 추가

        public readonly createdAt: Date,
        public updatedAt: Date,
        public deletedAt: Date | null
    ) {}

    public static Create(title: string, content: string, isAnonymous: boolean, authorId: string, boardId: number, createdAt: Date) {
        return new Post(
            null,
            title,
            content,
            isAnonymous,
            [],
            authorId,
            null,
            boardId,
            null,
            null,
            null,
            createdAt,
            createdAt,
            null
        )
    }

    public static FromRow(row: any) {
        return new Post(
            row.id,
            row.title,
            row.content,
            row.isAnonymous,
            row.comments ? row.comments.map((comment: any) => Comment.FromRow(comment)) : [],
            row.authorId,
            row.author ? User.FromRow(row.author) : null,
            row.boardId,
            row.board ? Board.FromRow(row.board) : null,
            row.attachments ? row.attachments.map((attachment: any) => Attachment.FromRow(attachment)) : null,
            null, // 수정 필요
            row.createdAt,
            row.updatedAt,
            row.deletedAt
        );
    }
}