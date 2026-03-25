/*
  Warnings:

  - A unique constraint covering the columns `[api_token]` on the table `inventories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "inventories" ADD COLUMN     "api_token" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "inventories_api_token_key" ON "inventories"("api_token");
