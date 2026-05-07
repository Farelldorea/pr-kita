"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, ClipboardList, Users, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserRole, Kelas } from "@/types"
import { TINGKAT_KELAS } from "@/constants"

const kelasSchema = z.object({
  nama: z.string().min(2, "Nama kelas minimal 2 karakter"),
  tingkat: z.string().min(1, "Pilih tingkat"),
  tahun_ajaran: z.string().min(4, "Isi tahun ajaran"),
})
type KelasInput = z.infer<typeof kelasSchema>

interface Props { role: UserRole; userId: string }

export function KelasPage({ role, userId }: Props) {
  const [kelas, setKelas] = useState<Kelas[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tingkat, setTingkat] = useState("")
  const supabase = createClient()

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<KelasInput>({
    resolver: zodResolver(kelasSchema),
  })

  const load = async () => {
    const query = role === "admin"
      ? supabase.from("kelas").select("*").order("created_at", { ascending: false })
      : supabase.from("kelas").select("*").eq("guru_id", userId).order("created_at", { ascending: false })
    const { data } = await query
    setKelas(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (data: KelasInput) => {
    const { error } = await supabase.from("kelas").insert({ ...data, guru_id: userId })
    if (!error) { setOpen(false); reset(); load() }
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Kelas"
        description="Kelola kelas yang kamu ampu"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />Tambah Kelas
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : kelas.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada kelas"
          description="Tambahkan kelas pertama kamu"
          action={<Button size="sm" onClick={() => setOpen(true)}>Tambah Kelas</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kelas.map((k, i) => (
            <motion.div
              key={k.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-medium">
                  Kelas {k.tingkat}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 mt-3">{k.nama}</h3>
              <p className="text-xs text-slate-400 mt-1">TA {k.tahun_ajaran}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kelas Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Kelas</Label>
              <Input placeholder="Contoh: 7A, 10 IPA 1" {...register("nama")} />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tingkat</Label>
                <Select onValueChange={(v) => { setTingkat(v); setValue("tingkat", v) }}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    {TINGKAT_KELAS.map((t) => <SelectItem key={t} value={t}>Kelas {t}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.tingkat && <p className="text-xs text-red-500">{errors.tingkat.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Tahun Ajaran</Label>
                <Input placeholder="2024/2025" {...register("tahun_ajaran")} />
                {errors.tahun_ajaran && <p className="text-xs text-red-500">{errors.tahun_ajaran.message}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
