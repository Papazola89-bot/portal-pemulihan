import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  const archive = await prisma.jadualArchive.findUnique({ where: { id } })
  if (!archive) return NextResponse.json({ error: "Tidak dijumpai" }, { status: 404 })

  return NextResponse.json(archive)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  await prisma.jadualArchive.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
