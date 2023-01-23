-- CreateTable
CREATE TABLE `Pasien` (
    `id` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(191) NOT NULL,
    `no_telp` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `foto` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'PASIEN') NOT NULL DEFAULT 'PASIEN',
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Pasien_no_telp_key`(`no_telp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Login_Attempt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pasienId` VARCHAR(191) NOT NULL,
    `limitTime` DATETIME(3) NULL,
    `countAttempt` INTEGER NOT NULL,

    UNIQUE INDEX `Login_Attempt_pasienId_key`(`pasienId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shorten` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(255) NOT NULL,
    `alias` VARCHAR(255) NOT NULL,
    `expiration` DATETIME(3) NULL,
    `pasienId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Shorten_alias_key`(`alias`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Login_Attempt` ADD CONSTRAINT `Login_Attempt_pasienId_fkey` FOREIGN KEY (`pasienId`) REFERENCES `Pasien`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shorten` ADD CONSTRAINT `Shorten_pasienId_fkey` FOREIGN KEY (`pasienId`) REFERENCES `Pasien`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
