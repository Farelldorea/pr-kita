import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TugasDetail } from "@/components/tugas/tugas-detail"

export default async function TugasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  if (!profile) redirect("/login")

  const { data: tugas } = await supabase
    .from("tugas")
    .select("*, kelas(*), guru:profiles!tugas_guru_id_fkey(*)")
    .eq("id", id)
    .single()

  if (!tugas) notFound()

  const { data: pengumpulan } = await supabase
    .from("pengumpulan")
    .select("*, siswa:profiles!pengumpulan_siswa_id_fkey(*)")
    .eq("tugas_id", id)

  const mySubmission = pengumpulan?.find((p) => p.siswa_id === user.id) || null

  return (
    <DashboardLayout role={profile.role} userName={profile.full_name}>
      <TugasDetail
        tugas={tugas}
        role={profile.role}
        userId={user.id}
        pengumpulan={pengumpulan || []}
        mySubmission={mySubmission}
      />
    </DashboardLayout>
  )
}
