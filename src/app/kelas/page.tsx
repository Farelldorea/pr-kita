import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { KelasPage } from "@/components/kelas/kelas-page"

export default async function KelasPageRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile || profile.role === "siswa") redirect("/dashboard")

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name}>
      <KelasPage role={profile.role} userId={user.id} />
    </DashboardLayout>
  )
}
