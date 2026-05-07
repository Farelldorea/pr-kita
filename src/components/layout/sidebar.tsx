"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard, BookOpen, ClipboardList, Star, Users, Settings, LogOut, GraduationCap, Menu, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { UserRole } from "@/types"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "guru", "siswa"] },
  { href: "/tugas", label: "Tugas", icon: BookOpen, roles: ["admin", "guru", "siswa"] },
  { href: "/nilai", label: "Nilai", icon: Star, roles: ["admin", "guru", "siswa"] },
  { href: "/kelas", label: "Kelas", icon: ClipboardList, roles: ["admin", "guru"] },
  { href: "/users", label: "Pengguna", icon: Users, roles: ["admin"] },
  { href: "/profile", label: "Profil", icon: Settings, roles: ["admin", "guru", "siswa"] },
]

interface SidebarProps {
  role: UserRole
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const filtered = navItems.filter((item) => item.roles.includes(role))

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">EduTrack</p>
          <p className="text-xs text-slate-500 capitalize">{role}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {filtered.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-indigo-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{userName}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800">EduTrack</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: open ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="lg:hidden fixed top-0 left-0 z-40 w-72 h-full bg-white shadow-xl"
      >
        <SidebarContent />
      </motion.div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-slate-100 fixed left-0 top-0">
        <SidebarContent />
      </div>
    </>
  )
}
