"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { BookOpen, Clock, Upload, Star, FileText, Loader2, ArrowLeft, User } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { submitTugasSchema, nilaiSchema, SubmitTugasInput, NilaiInput } from "@/lib/validations/tugas"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserRole } from "@/types"
import Link from "next/link"

interface Props {
  tugas: any
  role: UserRole
  userId: string
  pengumpulan: any[]
  mySubmission: any | null
}

export function TugasDetail({ tugas, role, userId, pengumpulan, mySubmission }: Props) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [nilaiDialog, setNilaiDialog] = useState<any | null>(null)
  const [error, setError] = useState("")
  const supabase = createClient()

  const submitForm = useForm<SubmitTugasInput>({ resolver: zodResolver(submitTugasSchema) })
  const nilaiForm = useForm<NilaiInput>({ resolver: zodResolver(nilaiSchema) })

  const handleSubmitTugas = async (data: SubmitTugasInput) => {
    if (!file) { setError("Pilih file terlebih dahulu"); return }
    setUploading(true)
    setError("")

    const ext = file.name.split(".").pop()
    const path = `tugas/${tugas.id}/${userId}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from("submissions").upload(path, file)
    if (uploadError) { setError(uploadError.message); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from("submissions").getPublicUrl(path)

    const { error: dbError } = await supabase.from("pengumpulan").insert({
      tugas_id: tugas.id,
      siswa_id: userId,
      file_url: publicUrl,
      catatan: data.catatan,
      status: "belum_dinilai",
    })

    if (dbError) { setError(dbError.message); setUploading(false); return }
    setUploading(false)
    router.refresh()
  }

  const handleNilai = async (data: NilaiInput) => {
    if (!nilaiDialog) return
    await supabase.from("pengumpulan").update({
      nilai: data.nilai,
      feedback: data.feedback,
      status: "sudah_dinilai",
    }).eq("id", nilaiDialog.id)
    setNilaiDialog(null)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tugas">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{tugas.judul}</h1>
          <p className="text-sm text-slate-500">{tugas.mata_pelajaran} · Kelas {tugas.kelas?.nama}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Deskripsi Tugas</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{tugas.deskripsi}</p>
          </motion.div>

          {role === "siswa" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              {mySubmission ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-semibold text-slate-800">Tugas Sudah Dikumpulkan</h2>
                    <Badge variant={mySubmission.status === "sudah_dinilai" ? "success" : "warning"}>
                      {mySubmission.status === "sudah_dinilai" ? "Sudah Dinilai" : "Menunggu Penilaian"}
                    </Badge>
                  </div>
                  {mySubmission.status === "sudah_dinilai" && (
                    <div className="bg-indigo-50 rounded-xl p-4 mt-3">
                      <p className="text-sm text-slate-600">Nilai kamu:</p>
                      <p className="text-3xl font-bold text-indigo-600">{mySubmission.nilai}</p>
                      {mySubmission.feedback && (
                        <p className="text-sm text-slate-600 mt-2">Feedback: {mySubmission.feedback}</p>
                      )}
                    </div>
                  )}
                  <a href={mySubmission.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="mt-3">
                      <FileText className="w-4 h-4 mr-2" />Lihat File
                    </Button>
                  </a>
                </div>
              ) : (
                <div>
                  <h2 className="font-semibold text-slate-800 mb-4">Kumpulkan Tugas</h2>
                  <form onSubmit={submitForm.handleSubmit(handleSubmitTugas)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Upload File</Label>
                      <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                        <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 mb-2">
                          {file ? file.name : "Pilih file tugas kamu"}
                        </p>
                        <input
                          type="file"
                          className="hidden"
                          id="file-upload"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                        />
                        <label htmlFor="file-upload">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>Pilih File</span>
                          </Button>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Catatan (opsional)</Label>
                      <Textarea placeholder="Tambahkan catatan..." {...submitForm.register("catatan")} />
                    </div>
                    {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl">{error}</div>}
                    <Button type="submit" disabled={uploading} className="w-full">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Kumpulkan Tugas
                    </Button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {(role === "guru" || role === "admin") && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-800 mb-4">
                Pengumpulan ({pengumpulan.length})
              </h2>
              <div className="space-y-3">
                {pengumpulan.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-6">Belum ada yang mengumpulkan</p>
                )}
                {pengumpulan.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{p.siswa?.full_name}</p>
                        <p className="text-xs text-slate-400">
                          {format(new Date(p.submitted_at), "d MMM yyyy HH:mm", { locale: id })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.status === "sudah_dinilai" ? (
                        <Badge variant="success">{p.nilai}</Badge>
                      ) : (
                        <Badge variant="warning">Belum Dinilai</Badge>
                      )}
                      <a href={p.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><FileText className="w-4 h-4" /></Button>
                      </a>
                      {role === "guru" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setNilaiDialog(p); nilaiForm.setValue("nilai", p.nilai || 0); nilaiForm.setValue("feedback", p.feedback || "") }}
                        >
                          <Star className="w-4 h-4 mr-1" />Nilai
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Info Tugas</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Deadline</p>
                  <p className="font-medium text-slate-800">
                    {format(new Date(tugas.deadline), "d MMMM yyyy HH:mm", { locale: id })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Nilai Maksimal</p>
                  <p className="font-medium text-slate-800">{tugas.max_nilai}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-slate-500 text-xs">Guru</p>
                  <p className="font-medium text-slate-800">{tugas.guru?.full_name}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={!!nilaiDialog} onOpenChange={() => setNilaiDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beri Nilai - {nilaiDialog?.siswa?.full_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={nilaiForm.handleSubmit(handleNilai)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nilai (0-100)</Label>
              <Input type="number" min={0} max={100} {...nilaiForm.register("nilai", { valueAsNumber: true })} />
              {nilaiForm.formState.errors.nilai && (
                <p className="text-xs text-red-500">{nilaiForm.formState.errors.nilai.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Feedback (opsional)</Label>
              <Textarea placeholder="Berikan feedback untuk siswa..." {...nilaiForm.register("feedback")} />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setNilaiDialog(null)} className="flex-1">Batal</Button>
              <Button type="submit" className="flex-1">Simpan Nilai</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
