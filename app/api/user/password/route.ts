import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 })

  const body = await req.json()
  const { passwordLama, passwordBaru } = body

  if (!passwordLama || !passwordBaru) {
    return NextResponse.json({ error: "Sila isi semua ruangan" }, { status: 400 })
  }

  if (passwordBaru.length < 6) {
    return NextResponse.json({ error: "Password baru mestilah sekurang-kurangnya 6 aksara" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { username: session.user?.name as string },
  })

  if (!user) return NextResponse.json({ error: "Pengguna tidak dijumpai" }, { status: 404 })

  const valid = await bcrypt.compare(passwordLama, user.password)
  if (!valid) return NextResponse.json({ error: "Password lama tidak betul" }, { status: 400 })

  const hashed = await bcrypt.hash(passwordBaru, 10)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })

  return NextResponse.json({ ok: true })
}
