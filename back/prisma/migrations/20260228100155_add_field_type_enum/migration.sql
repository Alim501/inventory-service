/*
  Warnings:

  - Changed the type of `field_type` on the `inventory_fields` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('text_single', 'text_multi', 'number', 'boolean', 'image');

-- AlterTable
ALTER TABLE "inventory_fields" DROP COLUMN "field_type",
ADD COLUMN     "field_type" "FieldType" NOT NULL;
