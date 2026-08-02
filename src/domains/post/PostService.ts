import sanitize from "sanitize-html";
import CredentialFailed from "../../common/exceptions/CredentialFailed.js";
import ValidationException from "../../common/exceptions/ValidationException.js";
import prisma from "../../db/prisma.js";
import type AttachmentRepository from "../attachment/AttachmentRepository.js";
import PostNotFound from "./exceptions/PostNotFound.js";
import Post from "./PostDomain.js";
import type PostRepository from "./PostRepositorty.js";
import type User from "../user/UserDomain.js";

const safe = (content: string) => sanitize(content, {
    allowedTags: sanitize.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
        ...sanitize.defaults.allowedAttributes,
        img: ["src", "alt", "width", "height"]
    }
});

export default class PostService {
    private postRepo: PostRepository;
    private AttachmentRepo: AttachmentRepository;

    constructor(postRepo: PostRepository, attachmentRepo: AttachmentRepository) {
        this.postRepo = postRepo;
        this.AttachmentRepo = attachmentRepo;
    }

    public async CreatePost(authorId: string, title: string, content: string, isAnonymous: boolean, boardId: number, imageIds: Array<string>, attachmentIds: Array<string>, now: Date = new Date()) {
        const safeContent = safe(content);
        //const safeContent = content; // xss 필터링 끄고 테스트
        const post = Post.Create(title, safeContent, isAnonymous, authorId, boardId, now);
        return await prisma.$transaction(async tx => {
            const created = await this.postRepo.Create(post, tx);
            await this.AttachmentRepo.SetPostAttachments(created.id!, authorId, attachmentIds.concat(imageIds), tx);

            return created;
        });
    }

    public async UpdatePost(postId: number, authorId: string, title: string, content: string, attachmentIds: Array<string>) {
        await prisma.$transaction(async tx => {
            const post = await this.postRepo.FindById(postId);
            if (!post) {
                throw new PostNotFound(`Could not find a post with the id ${postId}.`);
            }

            post.title = title;
            post.content = content;
            // post.isAnonymous = isAnonymous;

            await this.postRepo.Update(postId, post, tx);
            await this.AttachmentRepo.SetPostAttachments(postId, authorId, attachmentIds, tx);
        });
    }

    public async DeletePost(postId: number, user: User, now: Date = new Date()) {
        const post = await this.postRepo.FindById(postId);
        if (!post) {
            throw new PostNotFound(`Could not find a post with the id ${postId}.`);
        }

        if (post.authorId != user.id && user.role != "ADMIN") {
            throw new CredentialFailed("Only the author or the administrator can delete this post.");
        }

        post.deletedAt = now;
        await this.postRepo.Update(postId, post);
    }

    public async GetPost(postId: number): Promise<Post>;
    public async GetPost(postId: number, silent: false): Promise<Post>;
    public async GetPost(postId: number, silent: true): Promise<Post | null>;

    public async GetPost(postId: number, silent: boolean = false) {
        const post = await this.postRepo.FindById(postId, true, true, true, true, true);
        if (!post && !silent) {
            throw new PostNotFound(`Could not find a post with the id ${postId}.`);
        }
        return post;
    }

    public async GetBoardPosts(boardId: number, page: number = 1, query: string | null = null) {
        if (page < 1) {
            throw new ValidationException("Invalid page");
        }

        return await this.postRepo.FindByBoardId(boardId, 10, (page - 1) * 10, query);
    }

    public async GetBoardPostCount(boardId: number, query: string | null = null) {
        return await this.postRepo.FetchBoardPostCount(boardId, query);
    }

    public async GetUserPosts(userId: string, page: number = 1, query: string | null = null) {
        if (page < 1) {
            throw new ValidationException("Invalid page");
        }

        const limit = 10;
        const offset = 10 * (page - 1);

        return await this.postRepo.FindByUserId(userId, limit, offset, query);
    }

    public async GetUserPostCount(userId: string, query: string | null) {
        return await this.postRepo.FetchUserPostCount(userId, query);
    }
}