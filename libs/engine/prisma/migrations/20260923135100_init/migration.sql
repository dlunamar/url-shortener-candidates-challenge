-- CreateTable
CREATE TABLE "short_urls" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "originalUrl" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
