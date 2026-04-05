-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Murid" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "jenisPemulihan" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Murid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subjek" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Subjek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kemahiran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "subjekId" TEXT NOT NULL,

    CONSTRAINT "Kemahiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KemahiranTick" (
    "id" TEXT NOT NULL,
    "muridId" TEXT NOT NULL,
    "kemahiranId" TEXT NOT NULL,
    "kuasai" BOOLEAN NOT NULL DEFAULT false,
    "tarikhTick" TIMESTAMP(3),

    CONSTRAINT "KemahiranTick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jadual" (
    "id" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "masa" TEXT NOT NULL,
    "subjek" TEXT NOT NULL,
    "kelas" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Jadual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saringan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,

    CONSTRAINT "Saringan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaringanTick" (
    "id" TEXT NOT NULL,
    "saringanId" TEXT NOT NULL,
    "muridId" TEXT NOT NULL,
    "kuasai" BOOLEAN NOT NULL DEFAULT false,
    "kuasaiBM" BOOLEAN NOT NULL DEFAULT false,
    "kuasaiMat" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SaringanTick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "KemahiranTick_muridId_kemahiranId_key" ON "KemahiranTick"("muridId", "kemahiranId");

-- CreateIndex
CREATE UNIQUE INDEX "SaringanTick_saringanId_muridId_key" ON "SaringanTick"("saringanId", "muridId");

-- AddForeignKey
ALTER TABLE "Kemahiran" ADD CONSTRAINT "Kemahiran_subjekId_fkey" FOREIGN KEY ("subjekId") REFERENCES "Subjek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KemahiranTick" ADD CONSTRAINT "KemahiranTick_muridId_fkey" FOREIGN KEY ("muridId") REFERENCES "Murid"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KemahiranTick" ADD CONSTRAINT "KemahiranTick_kemahiranId_fkey" FOREIGN KEY ("kemahiranId") REFERENCES "Kemahiran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaringanTick" ADD CONSTRAINT "SaringanTick_saringanId_fkey" FOREIGN KEY ("saringanId") REFERENCES "Saringan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaringanTick" ADD CONSTRAINT "SaringanTick_muridId_fkey" FOREIGN KEY ("muridId") REFERENCES "Murid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
