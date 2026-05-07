import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CreateTugasForm } from "@/components/tugas/create-tugas-form"

export default async function CreateTugasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile || profile.role === "siswa") redirect("/dashboard")

  const { data: kelas } = await supabase.from("kelas").select("*").eq("guru_id", user.id)

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name}>
      <CreateTugasForm userId={user.id} kelasList={kelas || []} />
    </DashboardLayout>
  )
}
