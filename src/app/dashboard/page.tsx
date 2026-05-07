import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SiswaDashboard } from "@/components/dashboard/siswa-dashboard"
import { GuruDashboard } from "@/components/dashboard/guru-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name}>
      {profile.role === "siswa" && <SiswaDashboard userId={user.id} />}
      {profile.role === "guru" && <GuruDashboard userId={user.id} />}
      {profile.role === "admin" && <AdminDashboard />}
    </DashboardLayout>
  )
}
