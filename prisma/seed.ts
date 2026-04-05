import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Create default user
  const hashedPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: hashedPassword },
  })

  // Create BM subject with 32 kemahiran
  const bm = await prisma.subjek.upsert({
    where: { id: "subjek-bm" },
    update: {},
    create: {
      id: "subjek-bm",
      nama: "Bahasa Malaysia",
      kemahiran: {
        create: [
          { urutan: 1, nama: "Mengenal huruf vokal (a, e, i, o, u)" },
          { urutan: 2, nama: "Mengenal huruf konsonan" },
          { urutan: 3, nama: "Membunyikan huruf vokal" },
          { urutan: 4, nama: "Membunyikan huruf konsonan" },
          { urutan: 5, nama: "Membunyikan suku kata KV" },
          { urutan: 6, nama: "Membunyikan suku kata KVK" },
          { urutan: 7, nama: "Membaca perkataan KV+KV" },
          { urutan: 8, nama: "Membaca perkataan KV+KVK" },
          { urutan: 9, nama: "Membaca perkataan KVK+KV" },
          { urutan: 10, nama: "Membaca perkataan KVK+KVK" },
          { urutan: 11, nama: "Membaca perkataan berimbuhan" },
          { urutan: 12, nama: "Membaca perkataan digraf (ng, ny, sy)" },
          { urutan: 13, nama: "Membaca perkataan diftong (ai, au, oi)" },
          { urutan: 14, nama: "Membaca frasa mudah" },
          { urutan: 15, nama: "Membaca ayat mudah" },
          { urutan: 16, nama: "Membaca ayat dengan sebutan yang betul" },
          { urutan: 17, nama: "Membaca petikan pendek" },
          { urutan: 18, nama: "Menjawab soalan pemahaman mudah" },
          { urutan: 19, nama: "Menulis huruf vokal" },
          { urutan: 20, nama: "Menulis huruf konsonan" },
          { urutan: 21, nama: "Menulis suku kata KV" },
          { urutan: 22, nama: "Menulis suku kata KVK" },
          { urutan: 23, nama: "Menulis perkataan KV+KV" },
          { urutan: 24, nama: "Menulis perkataan KV+KVK" },
          { urutan: 25, nama: "Menulis perkataan KVK+KVK" },
          { urutan: 26, nama: "Menulis perkataan berimbuhan" },
          { urutan: 27, nama: "Menulis frasa mudah" },
          { urutan: 28, nama: "Menulis ayat mudah" },
          { urutan: 29, nama: "Ejaan perkataan mudah" },
          { urutan: 30, nama: "Ejaan perkataan berimbuhan" },
          { urutan: 31, nama: "Melengkapkan ayat" },
          { urutan: 32, nama: "Menulis ayat berdasarkan gambar" },
        ],
      },
    },
  })

  // Create Matematik subject with 9 kemahiran
  const mat = await prisma.subjek.upsert({
    where: { id: "subjek-mat" },
    update: {},
    create: {
      id: "subjek-mat",
      nama: "Matematik",
      kemahiran: {
        create: [
          { urutan: 1, nama: "Mengenal nombor 1 hingga 10" },
          { urutan: 2, nama: "Mengenal nombor 11 hingga 20" },
          { urutan: 3, nama: "Mengenal nombor 21 hingga 100" },
          { urutan: 4, nama: "Operasi tambah dalam lingkungan 10" },
          { urutan: 5, nama: "Operasi tambah dalam lingkungan 100" },
          { urutan: 6, nama: "Operasi tolak dalam lingkungan 10" },
          { urutan: 7, nama: "Operasi tolak dalam lingkungan 100" },
          { urutan: 8, nama: "Mengenal nilai wang" },
          { urutan: 9, nama: "Mengenal bentuk geometri asas" },
        ],
      },
    },
  })

  console.log("✅ Seed berjaya! Login dengan: admin / admin123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
