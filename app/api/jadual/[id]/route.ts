import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const jadual = await prisma.jadual.update({
    where: { id },
    data: { hari: body.hari, masa: body.masa, subjek: body.subjek, kelas: body.kelas ?? "" },
  })
  return NextResponse.json(jadual)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  await prisma.jadual.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
