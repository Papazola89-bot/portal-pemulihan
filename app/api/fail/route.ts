import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const fail = await prisma.failPautan.findMany({
    orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
  })
  return NextResponse.json(fail)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  if (!body.tajuk?.trim() || !body.url?.trim()) {
    return NextResponse.json({ error: "Tajuk dan pautan wajib diisi" }, { status: 400 })
  }

  const fail = await prisma.failPautan.create({
    data: {
      tajuk: body.tajuk.trim(),
      url: body.url.trim(),
      keterangan: body.keterangan?.trim() ?? "",
    },
  })
  return NextResponse.json(fail)
}
