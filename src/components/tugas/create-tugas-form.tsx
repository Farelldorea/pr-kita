"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { tugasSchema, TugasInput } from "@/lib/validations/tugas"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { MATA_PELAJARAN } from "@/constants"
import { Kelas } from "@/types"
import { useState } from "react"

interface Props { userId: string; kelasList: Kelas[] }

export function CreateTugasForm({ userId, kelasList }: Props) {
  const router = useRouter()
  const [error, setError] = useState("")
  const supabase = createClient()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<TugasInput>({
    resolver: zodResolver(tugasSchema),
    defaultValues: { max_nilai: 100 },
  })

  const onSubmit = async (data: TugasInput) => {
    setError("")
    const { error } = await supabase.from("tugas").insert({
      ...data,
      guru_id: userId,
    })
    if (error) { setError(error.message); return }
    router.push("/tugas")
    router.refresh()
  }

  return (
    <div>
      <PageHeader title="Buat Tugas Baru" description="Isi detail tugas untuk siswa" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Judul Tugas</Label>
            <Input placeholder="Contoh: PR Matematika Bab 3" {...register("judul")} />
            {errors.judul && <p className="text-xs text-red-500">{errors.judul.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea placeholder="Jelaskan detail tugas..." rows={4} {...register("deskripsi")} />
            {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mata Pelajaran</Label>
              <Select onValueChange={(v) => setValue("mata_pelajaran", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mapel" />
                </SelectTrigger>
                <SelectContent>
                  {MATA_PELAJARAN.map((mp) => (
                    <SelectItem key={mp} value={mp}>{mp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mata_pelajaran && <p className="text-xs text-red-500">{errors.mata_pelajaran.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Kelas</Label>
              <Select onValueChange={(v) => setValue("kelas_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.length === 0 && (
                    <SelectItem value="none" disabled>Belum ada kelas</SelectItem>
                  )}
                  {kelasList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kelas_id && <p className="text-xs text-red-500">{errors.kelas_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input type="datetime-local" {...register("deadline")} />
              {errors.deadline && <p className="text-xs text-red-500">{errors.deadline.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Nilai Maksimal</Label>
              <Input
                type="number"
                min={1}
                max={100}
                {...register("max_nilai", { valueAsNumber: true })}
              />
              {errors.max_nilai && <p className="text-xs text-red-500">{errors.max_nilai.message}</p>}
            </div>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl">{error}</div>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buat Tugas"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
