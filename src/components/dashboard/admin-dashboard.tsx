"use client"

import { useEffect, useState } from "react"
import { Users, BookOpen, ClipboardList, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { StatCard } from "@/components/shared/stat-card"
import { PageHeader } from "@/components/shared/page-header"

export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, tugas: 0, kelas: 0, pengumpulan: 0 })
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const [{ count: users }, { count: tugas }, { count: kelas }, { count: pengumpulan }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("tugas").select("*", { count: "exact", head: true }),
        supabase.from("kelas").select("*", { count: "exact", head: true }),
        supabase.from("pengumpulan").select("*", { count: "exact", head: true }),
      ])
      setStats({ users: users || 0, tugas: tugas || 0, kelas: kelas || 0, pengumpulan: pengumpulan || 0 })
    }
    load()
  }, [])

  return (
    <div>
      <PageHeader title="Dashboard Admin" description="Ringkasan seluruh aktivitas sekolah" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Pengguna" value={stats.users} icon={Users} color="indigo" index={0} />
        <StatCard title="Total Tugas" value={stats.tugas} icon={BookOpen} color="green" index={1} />
        <StatCard title="Total Kelas" value={stats.kelas} icon={ClipboardList} color="yellow" index={2} />
        <StatCard title="Pengumpulan" value={stats.pengumpulan} icon={Star} color="purple" index={3} />
      </div>
    </div>
  )
}
