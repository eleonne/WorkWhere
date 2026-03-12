-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeleworkDay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TELEWORK',
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TeleworkDay" ("comment", "createdAt", "date", "id", "updatedAt") SELECT "comment", "createdAt", "date", "id", "updatedAt" FROM "TeleworkDay";
DROP TABLE "TeleworkDay";
ALTER TABLE "new_TeleworkDay" RENAME TO "TeleworkDay";
CREATE UNIQUE INDEX "TeleworkDay_date_key" ON "TeleworkDay"("date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
