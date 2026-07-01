import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  if (!body.tajuk?.trim() || !body.url?.trim()) {
    return NextResponse.json({ error: "Tajuk dan pautan wajib diisi" }, { status: 400 })
  }

  const fail = await prisma.failPautan.update({
    where: { id },
    data: {
      tajuk: body.tajuk.trim(),
      url: body.url.trim(),
      keterangan: body.keterangan?.trim() ?? "",
    },
  })
  return NextResponse.json(fail)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  await prisma.failPautan.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
