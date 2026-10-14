import Header from '@/components/common/header/Header'
import styles from './RoutinePage.module.scss'

function RoutinePage() {
  return (
    <section className={styles['routine-page']}>
      <Header title="루틴" showBack={false} />
      <p className={styles['message']}>루틴 기능을 준비 중이에요.</p>
    </section>
  )
}

export default RoutinePage
