import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import DashboardShell from "./_components/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const c = await cookies()
  const isGuest = !session && c.get("guest")?.value === "1"

  return <DashboardShell isGuest={isGuest}>{children}</DashboardShell>
}
