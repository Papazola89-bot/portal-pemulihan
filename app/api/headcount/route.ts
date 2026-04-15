import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const tahun = req.nextUrl.searchParams.get("tahun") ?? new Date().getFullYear().toString()
  const subjek = req.nextUrl.searchParams.get("subjek") ?? "BM"

  const entries = await prisma.headcountEntry.findMany({
    where: { tahun: parseInt(tahun), subjek },
    include: { murid: { select: { id: true, nama: true, kelas: true, jenisPemulihan: true } } },
    orderBy: [{ murid: { kelas: "asc" } }, { murid: { nama: "asc" } }],
  })

  return NextResponse.json(entries)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const { muridId, tahun, subjek, tov, oti1, ar1, oti2, ar2, oti3, ar3, etr } = body

  const entry = await prisma.headcountEntry.upsert({
    where: { muridId_tahun_subjek: { muridId, tahun: parseInt(tahun), subjek } },
    update: { tov, oti1, ar1, oti2, ar2, oti3, ar3, etr },
    create: { muridId, tahun: parseInt(tahun), subjek, tov, oti1, ar1, oti2, ar2, oti3, ar3, etr },
  })

  return NextResponse.json(entry)
}
