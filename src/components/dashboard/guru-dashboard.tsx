"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Users, ClipboardList, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { StatCard } from "@/components/shared/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Props { userId: string }

export function GuruDashboard({ userId }: Props) {
  const [stats, setStats] = useState({ tugas: 0, kelas: 0, pengumpulan: 0, belumDinilai: 0 })
  const [tugasTerbaru, setTugasTerbaru] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: tugas } = await supabase
        .from("tugas")
        .select("*")
        .eq("guru_id", userId)
        .order("created_at", { ascending: false })

      const { data: kelas } = await supabase
        .from("kelas")
        .select("id")
        .eq("guru_id", userId)

      const tugasIds = tugas?.map((t) => t.id) || []
      const { data: pengumpulan } = tugasIds.length > 0
        ? await supabase.from("pengumpulan").select("*").in("tugas_id", tugasIds)
        : { data: [] }

      const belumDinilai = pengumpulan?.filter((p) => p.status === "belum_dinilai").length || 0

      setStats({
        tugas: tugas?.length || 0,
        kelas: kelas?.length || 0,
        pengumpulan: pengumpulan?.length || 0,
        belumDinilai,
      })
      setTugasTerbaru(tugas?.slice(0, 5) || [])
    }
    load()
  }, [userId])

  return (
    <div>
      <PageHeader
        title="Dashboard Guru"
        description="Kelola tugas dan nilai siswa"
        action={
          <Link href="/tugas/create">
            <Button size="sm">+ Buat Tugas</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Total Tugas" value={stats.tugas} icon={BookOpen} color="indigo" index={0} />
        <StatCard title="Kelas Diampu" value={stats.kelas} icon={ClipboardList} color="green" index={1} />
        <StatCard title="Pengumpulan" value={stats.pengumpulan} icon={Users} color="yellow" index={2} />
        <StatCard title="Belum Dinilai" value={stats.belumDinilai} icon={Clock} color="red" index={3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Tugas Terbaru</h2>
          <Link href="/tugas">
            <span className="text-xs text-indigo-600 hover:underline">Lihat semua</span>
          </Link>
        </div>
        <div className="space-y-3">
          {tugasTerbaru.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Belum ada tugas dibuat</p>
          )}
          {tugasTerbaru.map((tugas) => (
            <Link key={tugas.id} href={`/tugas/${tugas.id}`}>
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{tugas.judul}</p>
                    <p className="text-xs text-slate-400">{tugas.mata_pelajaran}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {format(new Date(tugas.deadline), "d MMM", { locale: id })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
