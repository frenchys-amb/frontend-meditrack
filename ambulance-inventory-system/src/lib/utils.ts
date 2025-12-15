import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-ES').format(num)
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function isExpired(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

export function isNearExpiration(dateString: string | null | undefined): boolean {
  if (!dateString) return false
  const now = new Date()
  const exp = new Date(dateString)
  const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) // days
  return diff <= 30 && diff >= 0
}

