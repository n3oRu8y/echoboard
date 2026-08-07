import sanitize from "sanitize-html";
import CredentialFailed from "../../common/exceptions/CredentialFailed.js";
import ValidationException from "../../common/exceptions/ValidationException.js";
import prisma from "../../db/prisma.js";
import type AttachmentRepository from "../attachment/AttachmentRepository.js";
import PostNotFound from "./exceptions/PostNotFound.js";
import Post from "./PostDomain.js";
import type PostRepository from "./PostRepositorty.js";
import type User from "../user/UserDomain.js";
import TurnstileService from "../../infrastructures/turnstile/TurnstileService.js";

export const safe = (content: string) =>
    sanitize(content, {
        allowedTags: sanitize.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
            ...sanitize.defaults.allowedAttributes,
            img: ["src", "alt", "width", "height"]
        },
        transformTags: {
            img(tagName, attribs) {
                if (!attribs.src?.startsWith("/api/attachments/")) {
                    delete attribs.src;
                }

                return {
                    tagName,
                    attribs
                };
            }
        }
    });

export default class PostService {
    private postRepo: PostRepository;
    private AttachmentRepo: AttachmentRepository;

    constructor(postRepo: PostRepository, attachmentRepo: AttachmentRepository) {
        this.postRepo = postRepo;
        this.AttachmentRepo = attachmentRepo;
    }

    public async CreatePost(authorId: string, title: string, content: string, isAnonymous: boolean, isNotice: boolean, boardId: number, imageIds: Array<string>, attachmentIds: Array<string>, token: string, ip: string, now: Date = new Date()) {
        await TurnstileService.Verify(token, ip);
        const safeContent = safe(content);
        //const safeContent = content; // xss 필터링 끄고 테스트
        const post = Post.Create(title, safeContent, isAnonymous, isNotice, authorId, boardId, now);
        return await prisma.$transaction(async tx => {
            const created = await this.postRepo.Create(post, tx);
            await this.AttachmentRepo.SetPostAttachments(created.id!, authorId, attachmentIds.concat(imageIds), tx);

            return created;
        });
    }

    public async UpdatePost(postId: number, boardUrl: string, user: User, title: string, content: string, isNotice: boolean, attachmentIds: Array<string>, token: string, ip: string) {
        await TurnstileService.Verify(token, ip);
        await prisma.$transaction(async tx => {
            const post = await this.postRepo.FindByIdAndBoardUrl(postId, boardUrl);
            if (!post) {
                throw new PostNotFound(`Could not find a post with the id ${postId}.`);
            }

            const isAuthor = post.authorId == user.id;
            const isAdmin = user.role == "ADMIN";
            if (!isAuthor && !isAdmin) {
                throw new CredentialFailed("Only the author or the administrator can edit this post.");
            }

            if (post.isNotice != isNotice && !isAdmin) {
                throw new CredentialFailed("Only the administrator can close notice.");
            }

            if (!isAuthor) {
                if (post.title != title || post.content != content) {
                    throw new CredentialFailed("Only the author can edit the title or content.");
                }

                post.isNotice = isNotice;
                await this.postRepo.Update(postId, post, tx);
                return;
            }

            post.title = title;
            post.content = safe(content);
            post.isNotice = isNotice;
            // post.isAnonymous = isAnonymous;

            await this.postRepo.Update(postId, post, tx);
            await this.AttachmentRepo.SetPostAttachments(postId, user.id!, attachmentIds, tx);
        });
    }

    public async DeletePost(postId: number, boardUrl: string, user: User, now: Date = new Date()) {
        const post = await this.postRepo.FindByIdAndBoardUrl(postId, boardUrl, false, false, true);
        if (!post) {
            throw new PostNotFound(`Could not find a post with the id ${postId}.`);
        }

        if (post.authorId != user.id && user.role != "ADMIN") {
            throw new CredentialFailed("Only the author or the administrator can delete this post.");
        }

        post.deletedAt = now;
        await prisma.$transaction(async tx => {
            await this.postRepo.Update(postId, post, tx);

            for (const attachment of post.attachments ?? []) {
                if (attachment.deletedAt) {
                    continue;
                }

                attachment.deletedAt = now;
                await this.AttachmentRepo.Update(attachment.id!, attachment, tx);
            }
        });
    }

    public async GetPost(postId: number, boardUrl: string): Promise<Post>;
    public async GetPost(postId: number, boardUrl: string, silent: false, withFk?: boolean): Promise<Post>;
    public async GetPost(postId: number, boardUrl: string, silent: true, withFk?: boolean): Promise<Post | null>;

    public async GetPost(postId: number, boardUrl: string, silent: boolean = false, withFk: boolean = false) {
        const post = await this.postRepo.FindByIdAndBoardUrl(postId, boardUrl, withFk, withFk, withFk, withFk, withFk);
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
