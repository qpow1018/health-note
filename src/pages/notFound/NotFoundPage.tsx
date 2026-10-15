import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.scss'

function NotFoundPage() {
  return (
    <div className={styles['not-found']}>
      <h1>페이지를 찾을 수 없어요.</h1>
      <Link to="/">메인으로</Link>
    </div>
  )
}

export default NotFoundPage
