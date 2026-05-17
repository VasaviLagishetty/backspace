'use client'
import * as React from 'react'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from './toast'

type ToastData = { id: string; title?: string; description?: string; variant?: 'default' | 'destructive' }

const toastState = { toasts: [] as ToastData[], listeners: new Set<() => void>() }

function notify() { toastState.listeners.forEach(l => l()) }

export function toast(data: Omit<ToastData, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toastState.toasts.push({ ...data, id })
  notify()
  setTimeout(() => {
    toastState.toasts = toastState.toasts.filter(t => t.id !== id)
    notify()
  }, 5000)
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastData[]>([])
  React.useEffect(() => {
    const update = () => setToasts([...toastState.toasts])
    toastState.listeners.add(update)
    return () => { toastState.listeners.delete(update) }
  }, [])

  return (
    <ToastProvider>
      {toasts.map(t => (
        <Toast key={t.id} variant={t.variant}>
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
