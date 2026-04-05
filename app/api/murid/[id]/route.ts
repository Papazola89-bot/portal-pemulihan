import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const murid = await prisma.murid.update({
    where: { id },
    data: {
      nama: body.nama,
      kelas: body.kelas,
      jenisPemulihan: body.jenisPemulihan,
      tahun: parseInt(body.tahun),
    },
  })
  return NextResponse.json(murid)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  await prisma.murid.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
