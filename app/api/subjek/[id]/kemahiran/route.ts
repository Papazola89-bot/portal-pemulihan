import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const count = await prisma.kemahiran.count({ where: { subjekId: id } })
  const k = await prisma.kemahiran.create({
    data: { nama: body.nama, subjekId: id, urutan: count + 1 },
  })
  return NextResponse.json(k)
}
