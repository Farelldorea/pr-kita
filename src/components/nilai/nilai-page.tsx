"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Star, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UserRole } from "@/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface Props { role: UserRole; userId: string }

export function NilaiPage({ role, userId }: Props) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      if (role === "siswa") {
        const { data } = await supabase
          .from("pengumpulan")
          .select("*, tugas(*)")
          .eq("siswa_id", userId)
          .eq("status", "sudah_dinilai")
          .order("submitted_at", { ascending: false })
        setData(data || [])
      } else {
        const { data: tugas } = await supabase.from("tugas").select("id").eq("guru_id", userId)
        const ids = tugas?.map((t) => t.id) || []
        if (ids.length > 0) {
          const { data } = await supabase
            .from("pengumpulan")
            .select("*, tugas(*), siswa:profiles!pengumpulan_siswa_id_fkey(*)")
            .in("tugas_id", ids)
            .eq("status", "sudah_dinilai")
            .order("submitted_at", { ascending: false })
          setData(data || [])
        }
      }
      setLoading(false)
    }
    load()
  }, [role, userId])

  const rataRata = data.length > 0
    ? Math.round(data.reduce((a, d) => a + (d.nilai || 0), 0) / data.length)
    : 0

  return (
    <div>
      <PageHeader title="Nilai" description={role === "siswa" ? "Rekap nilai kamu" : "Rekap nilai siswa"} />

      {role === "siswa" && (
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm">Rata-rata Nilai</p>
              <p className="text-4xl font-bold mt-1">{rataRata}</p>
              <p className="text-indigo-200 text-sm mt-1">{data.length} tugas dinilai</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={rataRata} className="bg-indigo-400 h-2" />
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">Belum ada nilai</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.tugas?.judul}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.tugas?.mata_pelajaran}</p>
                  {role !== "siswa" && (
                    <p className="text-xs text-slate-500 mt-0.5">{item.siswa?.full_name}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(item.submitted_at), "d MMM yyyy", { locale: id })}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${item.nilai >= 75 ? "text-green-600" : item.nilai >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                    {item.nilai}
                  </div>
                  <p className="text-xs text-slate-400">/ {item.tugas?.max_nilai}</p>
                </div>
              </div>
              {item.feedback && (
                <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-slate-500">{item.feedback}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
