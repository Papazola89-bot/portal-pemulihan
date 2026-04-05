import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const tahun = req.nextUrl.searchParams.get("tahun")
  const murid = await prisma.murid.findMany({
    where: tahun ? { tahun: parseInt(tahun) } : {},
    orderBy: { nama: "asc" },
  })
  return NextResponse.json(murid)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const murid = await prisma.murid.create({
    data: {
      nama: body.nama,
      kelas: body.kelas,
      jenisPemulihan: body.jenisPemulihan,
      tahun: parseInt(body.tahun),
    },
  })
  return NextResponse.json(murid)
}
