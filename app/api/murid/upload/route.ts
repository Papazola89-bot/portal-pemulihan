import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const rows: { nama: string; kelas: string; jenisPemulihan: string; tahun: string }[] = body.rows

  let count = 0
  for (const r of rows) {
    await prisma.murid.create({
      data: {
        nama: r.nama,
        kelas: r.kelas,
        jenisPemulihan: r.jenisPemulihan,
        tahun: parseInt(r.tahun),
      },
    })
    count++
  }

  return NextResponse.json({ count })
}
