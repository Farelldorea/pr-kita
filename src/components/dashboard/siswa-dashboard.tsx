"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Star, Clock, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { StatCard } from "@/components/shared/stat-card"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"

interface Props { userId: string }

export function SiswaDashboard({ userId }: Props) {
  const [stats, setStats] = useState({ total: 0, dikumpulkan: 0, dinilai: 0, rataRata: 0 })
  const [tugasTerbaru, setTugasTerbaru] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: pengumpulan } = await supabase
        .from("pengumpulan")
        .select("*, tugas(*)")
        .eq("siswa_id", userId)

      const { data: tugas } = await supabase
        .from("tugas")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (pengumpulan) {
        const dinilai = pengumpulan.filter((p) => p.status === "sudah_dinilai")
        const rataRata = dinilai.length > 0
          ? Math.round(dinilai.reduce((a, p) => a + (p.nilai || 0), 0) / dinilai.length)
          : 0
        setStats({
          total: tugas?.length || 0,
          dikumpulkan: pengumpulan.length,
          dinilai: dinilai.length,
          rataRata,
        })
      }
      setTugasTerbaru(tugas || [])
    }
    load()
  }, [userId])

  return (
    <div>
      <PageHeader title="Dashboard Siswa" description="Pantau tugas dan nilai kamu" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Total Tugas" value={stats.total} icon={BookOpen} color="indigo" index={0} />
        <StatCard title="Dikumpulkan" value={stats.dikumpulkan} icon={CheckCircle} color="green" index={1} />
        <StatCard title="Sudah Dinilai" value={stats.dinilai} icon={Star} color="yellow" index={2} />
        <StatCard title="Rata-rata Nilai" value={stats.rataRata} icon={Star} color="purple" index={3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
      >
        <h2 className="font-semibold text-slate-800 mb-4">Tugas Terbaru</h2>
        <div className="space-y-3">
          {tugasTerbaru.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">Belum ada tugas</p>
          )}
          {tugasTerbaru.map((tugas) => (
            <Link key={tugas.id} href={`/tugas/${tugas.id}`}>
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{tugas.judul}</p>
                    <p className="text-xs text-slate-400">{tugas.mata_pelajaran}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {format(new Date(tugas.deadline), "d MMM", { locale: id })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
