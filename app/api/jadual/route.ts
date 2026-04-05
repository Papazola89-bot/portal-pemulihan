import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const urutan = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat"]
  const jadual = await prisma.jadual.findMany()
  jadual.sort((a, b) => urutan.indexOf(a.hari) - urutan.indexOf(b.hari))
  return NextResponse.json(jadual)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const jadual = await prisma.jadual.create({
    data: { hari: body.hari, masa: body.masa, subjek: body.subjek, kelas: body.kelas ?? "" },
  })
  return NextResponse.json(jadual)
}
