import Comment from "./CommentDomain.js";
import type CommentRepository from "./CommentRepository.js";
import CommentNotFound from "./exceptions/CommentNotFound.js";

export default class CommentService {
    constructor(
        private repo: CommentRepository
    ) {}

    public async Create(authorId: string, isAnonymous: boolean, content: string, postId: number, parentId: number | null, now: Date = new Date()): Promise<Comment | boolean> {
        const comment = new Comment(
            null,
            authorId,
            null,
            isAnonymous,
            content,
            postId,
            parentId,
            null,
            [],
            now,
            now,
            null
        );
        const row = await this.repo.Create(comment);
        return row ? Comment.FromRow(row) : false;
    }

    public async Get(commentId: number): Promise<Comment | null> {
        return await this.repo.FindById(commentId);
    }

    public async Delete(commentId: number, silent: boolean = false) {
        const comment = await this.repo.FindById(commentId);
        if (!comment) {
            if (silent) return false;
            else return new CommentNotFound(`Could not find a comment with the id ${commentId}.`);
        }
        
        const now = new Date();
        comment.deletedAt = now;
        await this.repo.Update(commentId, comment);
        
        return true;
    }
};