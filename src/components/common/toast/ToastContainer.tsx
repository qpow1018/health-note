import { useEffect, useSyncExternalStore } from 'react'
import { MdClose } from 'react-icons/md'
import { getToastSnapshot, removeToast, subscribeToast } from '@/utils/toast'
import type { TToastItem } from '@/utils/toast'
import styles from './ToastContainer.module.scss'

export default function ToastContainer() {
  const toasts = useSyncExternalStore(subscribeToast, getToastSnapshot)

  return (
    <div className={styles['toast-container']}>
      {toasts.map(function renderToast(toast) {
        return <ToastItem key={toast.id} toast={toast} />
      })}
    </div>
  )
}

function ToastItem({ toast }: { toast: TToastItem }) {
  useEffect(function scheduleDismiss() {
    const timeoutId = window.setTimeout(function dismissToast() {
      removeToast(toast.id)
    }, toast.duration)

    return function clearDismissTimer() {
      window.clearTimeout(timeoutId)
    }
  }, [toast.duration, toast.id])

  return (
    <div className={`${styles['toast']} ${styles[`type-${toast.type}`]}`}
      role={toast.type === 'error' ? 'alert' : 'status'}>
      <p className={styles['message']}>{toast.message}</p>
      {toast.isShowCloseButton && (
        <button type="button" className={styles['close-button']}
          onClick={() => removeToast(toast.id)} aria-label="토스트 닫기">
          <MdClose size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
