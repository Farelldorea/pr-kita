"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: "indigo" | "green" | "yellow" | "red" | "purple"
  description?: string
  index?: number
}

const colorMap = {
  indigo: { bg: "bg-indigo-50", icon: "bg-indigo-600", text: "text-indigo-600" },
  green: { bg: "bg-green-50", icon: "bg-green-600", text: "text-green-600" },
  yellow: { bg: "bg-yellow-50", icon: "bg-yellow-500", text: "text-yellow-600" },
  red: { bg: "bg-red-50", icon: "bg-red-500", text: "text-red-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-600", text: "text-purple-600" },
}

export function StatCard({ title, value, icon: Icon, color = "indigo", description, index = 0 }: StatCardProps) {
  const colors = colorMap[color]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.icon)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  )
}
