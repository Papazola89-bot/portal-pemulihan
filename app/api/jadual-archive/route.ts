import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const archives = await prisma.jadualArchive.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(archives)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const { label } = body

  // Ambil semua jadual semasa sebagai snapshot
  const jadualSemasa = await prisma.jadual.findMany()

  const archive = await prisma.jadualArchive.create({
    data: { label, data: jadualSemasa },
  })

  return NextResponse.json(archive)
}
