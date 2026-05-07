import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProfilePage } from "@/components/profile/profile-page"

export default async function ProfilePageRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name}>
      <ProfilePage profile={profile} />
    </DashboardLayout>
  )
}
