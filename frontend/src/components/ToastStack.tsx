import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useGameStore, type ToastItem } from '../store/useGameStore'

function Icon({ kind }: { kind: ToastItem['kind'] }) {
  if (kind === 'success') return <CheckCircle2 size={17} />
  if (kind === 'error') return <AlertTriangle size={17} />
  return <Info size={17} />
}

export function ToastStack() {
  const toasts = useGameStore((state) => state.toasts)
  const dismiss = useGameStore((state) => state.dismissToast)

  return (
    <div className="fixed right-4 top-20 z-[60] w-[min(360px,calc(100vw-2rem))] space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 32, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.97 }}
            className={`toast ${toast.kind === 'error' ? 'toast-error' : ''}`}
          >
            <span className="mt-0.5 text-cyan">
              <Icon kind={toast.kind} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-sm text-platinum">{toast.title}</span>
              {toast.message ? (
                <span className="mt-1 block font-mono text-xs text-platinum/55">{toast.message}</span>
              ) : null}
            </span>
            <button onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="text-platinum/45">
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
