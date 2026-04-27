import { createContext, useContext, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId.current++
    setToasts(prev => [...prev.slice(-3), { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 'var(--sp-6)',
        right: 'var(--sp-6)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-2)',
        maxWidth: 360,
        width: 'calc(100vw - var(--sp-12))',
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            role="alert"
            style={{
              padding: 'var(--sp-3) var(--sp-4)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'toast-in 150ms ease',
              background: t.type === 'error' ? '#FEF2F2' : t.type === 'success' ? '#F0FDF4' : '#EFF6FF',
              color: t.type === 'error' ? '#991B1B' : t.type === 'success' ? '#166534' : '#1D4ED8',
              borderLeft: `4px solid ${t.type === 'error' ? '#DC2626' : t.type === 'success' ? '#16A34A' : '#2563EB'}`,
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
