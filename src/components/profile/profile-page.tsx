"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { User, Mail, Shield, Loader2, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ROLE_LABELS } from "@/constants"
import { Profile } from "@/types"
import { useRouter } from "next/navigation"

const profileSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
})
type ProfileInput = z.infer<typeof profileSchema>

interface Props { profile: Profile }

export function ProfilePage({ profile }: Props) {
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    defaultValues: { full_name: profile.full_name },
  })

  const onSubmit = async (data: ProfileInput) => {
    await supabase.from("profiles").update({ full_name: data.full_name }).eq("id", profile.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div>
      <PageHeader title="Profil Saya" description="Kelola informasi akun kamu" />

      <div className="max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{profile.full_name}</h2>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <Badge className="mt-1">{ROLE_LABELS[profile.role]}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9" {...register("full_name")} />
              </div>
              {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9 bg-slate-50" value={profile.email} disabled />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input className="pl-9 bg-slate-50 capitalize" value={ROLE_LABELS[profile.role]} disabled />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <><Check className="w-4 h-4 mr-2" />Tersimpan</>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
