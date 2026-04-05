import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  // Upsert tick for a student in this saringan
  const updateData: Record<string, boolean> = {}
  if (typeof body.kuasai === "boolean") updateData.kuasai = body.kuasai
  if (typeof body.kuasaiBM === "boolean") updateData.kuasaiBM = body.kuasaiBM
  if (typeof body.kuasaiMat === "boolean") updateData.kuasaiMat = body.kuasaiMat

  const tick = await prisma.saringanTick.upsert({
    where: { saringanId_muridId: { saringanId: id, muridId: body.muridId } },
    update: updateData,
    create: { saringanId: id, muridId: body.muridId, ...updateData },
  })
  return NextResponse.json(tick)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  await prisma.saringan.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
