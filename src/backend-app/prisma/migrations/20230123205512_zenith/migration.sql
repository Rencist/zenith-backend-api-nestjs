-- CreateTable
CREATE TABLE `Check_In` (
    `id` VARCHAR(191) NOT NULL,
    `penyakit` VARCHAR(191) NOT NULL,
    `pasien_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Check_In_penyakit_key`(`penyakit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Check_In` ADD CONSTRAINT `Check_In_pasien_id_fkey` FOREIGN KEY (`pasien_id`) REFERENCES `Pasien`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
