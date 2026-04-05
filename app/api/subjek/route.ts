import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const subjek = await prisma.subjek.findMany({
    include: { kemahiran: { orderBy: { urutan: "asc" } } },
  })
  return NextResponse.json(subjek)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const subjek = await prisma.subjek.create({ data: { nama: body.nama } })
  return NextResponse.json(subjek)
}
