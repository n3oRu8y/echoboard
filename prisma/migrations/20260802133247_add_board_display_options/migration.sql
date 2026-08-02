-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Board" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT true,
    "canWrite" BOOLEAN NOT NULL DEFAULT true,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "showHome" BOOLEAN NOT NULL DEFAULT true,
    "showNavbar" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_Board" ("canRead", "canWrite", "createdAt", "createdBy", "deletedAt", "description", "id", "isPrivate", "name", "updatedAt", "url") SELECT "canRead", "canWrite", "createdAt", "createdBy", "deletedAt", "description", "id", "isPrivate", "name", "updatedAt", "url" FROM "Board";
DROP TABLE "Board";
ALTER TABLE "new_Board" RENAME TO "Board";
CREATE UNIQUE INDEX "Board_url_key" ON "Board"("url");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
