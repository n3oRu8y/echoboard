-- CreateIndex
CREATE INDEX "Post_authorId_deletedAt_idx" ON "Post"("authorId", "deletedAt");

-- CreateIndex
CREATE INDEX "Post_boardId_deletedAt_createdAt_idx" ON "Post"("boardId", "deletedAt", "createdAt");
