export type UserRole = "admin" | "guru" | "siswa"

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url?: string
  kelas_id?: string
  created_at: string
}

export interface Kelas {
  id: string
  nama: string
  tingkat: string
  tahun_ajaran: string
  guru_id: string
  created_at: string
}

export interface Tugas {
  id: string
  judul: string
  deskripsi: string
  mata_pelajaran: string
  kelas_id: string
  guru_id: string
  deadline: string
  max_nilai: number
  file_url?: string
  created_at: string
  kelas?: Kelas
  guru?: Profile
}

export interface Pengumpulan {
  id: string
  tugas_id: string
  siswa_id: string
  file_url: string
  catatan?: string
  nilai?: number
  feedback?: string
  status: "belum_dinilai" | "sudah_dinilai"
  submitted_at: string
  tugas?: Tugas
  siswa?: Profile
}
