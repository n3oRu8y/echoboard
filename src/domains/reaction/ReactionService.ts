import prisma from "../../db/prisma.js";
import ReactionNotFound from "./exceptions/ReactionNotFound.js";
import Reaction from "./ReactionDomain.js";
import type ReactionRepository from "./ReactionRepository.js";

export default class ReacitonService {
    public repo: ReactionRepository;

    public constructor(repo: ReactionRepository) {
        this.repo = repo;
    }

    public async ToggleReatcion(userId: string, postId: number, type: number, now: Date = new Date) { // 1이면 좋아요 0이면 싫어요
        await prisma.$transaction(async tx => {
            const reaction = await this.repo.FindByUserIdAndPostId(userId, postId, tx);
            if (!reaction) {
                await this.repo.Create(new Reaction(
                        null,
                        userId, 
                        null, 
                        postId,
                        null, 
                        type, 
                        now, 
                        now
                    ), tx);
                return;
            }

            await this.repo.Delete(reaction.id!, tx);
            if (reaction.type != type) {
                await this.repo.Create(new Reaction(
                    null,
                    userId,
                    null,
                    postId,
                    null,
                    type,
                    now,
                    now,
                ), tx);
            }

            return;
        });
    }

    public async DeleteReaction(id: number): Promise<void>;
    public async DeleteReaction(userId: string, postId: number): Promise<void>;

    public async DeleteReaction(idOrUserId: number | string, postId?: number): Promise<void> {
        await prisma.$transaction(async tx => {
            let reactionId: number;

            if (typeof idOrUserId === "number") {
                reactionId = idOrUserId;
            } else {
                const reaction = await this.repo.FindByUserIdAndPostId(idOrUserId, postId!);

                if (!reaction) {
                    throw new ReactionNotFound("Reaction not found for the given postId and userId.");
                }

                reactionId = reaction.id!;
            }

            await this.repo.Delete(reactionId, tx);
        });
    }
};