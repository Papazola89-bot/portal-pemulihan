import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  const archive = await prisma.jadualArchive.findUnique({ where: { id } })
  if (!archive) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 })

  const data = archive.data as { hari: string; masa: string; subjek: string; kelas: string }[]

  // Padam semua jadual semasa, kemudian cipta semula dari archive
  await prisma.jadual.deleteMany()
  await prisma.jadual.createMany({
    data: data.map(({ hari, masa, subjek, kelas }) => ({ hari, masa, subjek, kelas })),
  })

  return NextResponse.json({ ok: true })
}
