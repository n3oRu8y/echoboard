/*
  Warnings:

  - The primary key for the `PostReaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `PostReaction` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostReaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PostReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PostReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PostReaction" ("createdAt", "id", "postId", "type", "updatedAt", "userId") SELECT "createdAt", "id", "postId", "type", "updatedAt", "userId" FROM "PostReaction";
DROP TABLE "PostReaction";
ALTER TABLE "new_PostReaction" RENAME TO "PostReaction";
CREATE INDEX "PostReaction_postId_idx" ON "PostReaction"("postId");
CREATE INDEX "PostReaction_userId_idx" ON "PostReaction"("userId");
CREATE UNIQUE INDEX "PostReaction_userId_postId_key" ON "PostReaction"("userId", "postId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
