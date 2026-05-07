import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NilaiPage } from "@/components/nilai/nilai-page"

export default async function NilaiPageRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name}>
      <NilaiPage role={profile.role} userId={user.id} />
    </DashboardLayout>
  )
}
