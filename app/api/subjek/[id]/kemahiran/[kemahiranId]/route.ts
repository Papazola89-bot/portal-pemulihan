import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; kemahiranId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { kemahiranId } = await params
  const body = await req.json()
  const k = await prisma.kemahiran.update({
    where: { id: kemahiranId },
    data: { nama: body.nama },
  })
  return NextResponse.json(k)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; kemahiranId: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { kemahiranId } = await params
  await prisma.kemahiran.delete({ where: { id: kemahiranId } })
  return NextResponse.json({ ok: true })
}
