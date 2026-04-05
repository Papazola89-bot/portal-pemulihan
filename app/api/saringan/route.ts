import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const tahun = req.nextUrl.searchParams.get("tahun") ?? new Date().getFullYear().toString()
  const saringan = await prisma.saringan.findMany({
    where: { tahun: parseInt(tahun) },
    include: { ticks: true },
    orderBy: { nama: "asc" },
  })
  return NextResponse.json(saringan)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const saringan = await prisma.saringan.create({
    data: { nama: body.nama, tahun: parseInt(body.tahun) },
  })
  return NextResponse.json(saringan)
}
