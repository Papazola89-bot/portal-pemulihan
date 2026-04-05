import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const muridId = req.nextUrl.searchParams.get("muridId")
  if (!muridId) return NextResponse.json([])

  const ticks = await prisma.kemahiranTick.findMany({ where: { muridId } })
  return NextResponse.json(ticks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const tick = await prisma.kemahiranTick.upsert({
    where: { muridId_kemahiranId: { muridId: body.muridId, kemahiranId: body.kemahiranId } },
    update: { kuasai: body.kuasai, tarikhTick: body.kuasai ? new Date() : null },
    create: {
      muridId: body.muridId,
      kemahiranId: body.kemahiranId,
      kuasai: body.kuasai,
      tarikhTick: body.kuasai ? new Date() : null,
    },
  })
  return NextResponse.json(tick)
}
