-- CreateTable
CREATE TABLE `Check_In_Gejala` (
    `id` VARCHAR(191) NOT NULL,
    `gejala_id` VARCHAR(191) NOT NULL,
    `check_in_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Check_In_Gejala` ADD CONSTRAINT `Check_In_Gejala_gejala_id_fkey` FOREIGN KEY (`gejala_id`) REFERENCES `Gejala`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Check_In_Gejala` ADD CONSTRAINT `Check_In_Gejala_check_in_id_fkey` FOREIGN KEY (`check_in_id`) REFERENCES `Check_In`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
