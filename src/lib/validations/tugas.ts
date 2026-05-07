import { z } from "zod"

export const tugasSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter"),
  mata_pelajaran: z.string().min(2, "Mata pelajaran wajib diisi"),
  kelas_id: z.string().uuid("Pilih kelas yang valid"),
  deadline: z.string().min(1, "Deadline wajib diisi"),
  max_nilai: z.number().min(1).max(100),
})

export const submitTugasSchema = z.object({
  catatan: z.string().optional(),
})

export const nilaiSchema = z.object({
  nilai: z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
  feedback: z.string().optional(),
})

export type TugasInput = z.infer<typeof tugasSchema>
export type SubmitTugasInput = z.infer<typeof submitTugasSchema>
export type NilaiInput = z.infer<typeof nilaiSchema>
