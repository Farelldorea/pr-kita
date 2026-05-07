"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Clock, Plus, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserRole, Tugas } from "@/types"
import Link from "next/link"
import { format, isPast } from "date-fns"
import { id } from "date-fns/locale"

interface Props { role: UserRole; userId: string }

export function TugasList({ role, userId }: Props) {
  const [tugas, setTugas] = useState<Tugas[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      let query = supabase.from("tugas").select("*, kelas(*), guru:profiles!tugas_guru_id_fkey(*)").order("created_at", { ascending: false })
      if (role === "guru") query = query.eq("guru_id", userId)
      const { data } = await query
      setTugas(data || [])
      setLoading(false)
    }
    load()
  }, [role, userId])

  const filtered = tugas.filter((t) =>
    t.judul.toLowerCase().includes(search.toLowerCase()) ||
    t.mata_pelajaran.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Daftar Tugas"
        description={role === "guru" ? "Kelola tugas yang kamu buat" : "Lihat semua tugas"}
        action={
          role === "guru" ? (
            <Link href="/tugas/create">
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />Buat Tugas</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Cari tugas..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada tugas"
          description={role === "guru" ? "Buat tugas pertama untuk kelasmu" : "Belum ada tugas yang diberikan"}
          action={role === "guru" ? <Link href="/tugas/create"><Button size="sm">Buat Tugas</Button></Link> : undefined}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((t, i) => {
            const expired = isPast(new Date(t.deadline))
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/tugas/${t.id}`}>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-indigo-100 transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{t.judul}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{t.mata_pelajaran}</p>
                          {t.kelas && (
                            <p className="text-xs text-slate-400 mt-0.5">Kelas {t.kelas.nama}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={expired ? "destructive" : "default"} className="text-xs">
                          {expired ? "Lewat" : "Aktif"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1.5 justify-end">
                          <Clock className="w-3 h-3" />
                          {format(new Date(t.deadline), "d MMM yyyy", { locale: id })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
