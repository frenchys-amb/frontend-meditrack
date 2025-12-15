import * as React from "react"
import { ToastProps } from "@/components/ui/toast"

export type ToastOptions = Omit<ToastProps, "id"> & {
  duration?: number
}

let id = 0
const nextId = () => `${id++}`

// Contexto global para compartir toasts entre componentes
const ToastContext = React.createContext<{
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
  toasts: ToastProps[]
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback(({ duration = 4000, ...options }: ToastOptions) => {
    const newToast: ToastProps = {
      id: nextId(),
      ...options,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
    }, duration)

    return newToast.id
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    // Fallback para cuando no hay provider (compatibilidad hacia atrás)
    const [toasts, setToasts] = React.useState<ToastProps[]>([])
    const toast = ({ duration = 4000, ...options }: ToastOptions) => {
      const newToast: ToastProps = {
        id: nextId(),
        ...options,
      }
      setToasts((prev) => [...prev, newToast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
      }, duration)
      return newToast.id
    }
    const dismiss = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }
    return { toast, dismiss, toasts }
  }
  return context
}



