import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Header from '@/components/common/header/Header'
import ExerciseListPage from '@/pages/exercise/ExerciseListPage'
import ExerciseDetailPage from '@/pages/exercise/ExerciseDetailPage'
import ExerciseEditPage from '@/pages/exercise/ExerciseEditPage'
import ExerciseCreatePage from '@/pages/exercise/ExerciseCreatePage'
import styles from './App.module.scss'

function App() {
  return (
    <BrowserRouter>
      <main className={styles['app-shell']}>
        <Routes>
          <Route path="/" element={
            <div className={styles['home']}>
              <Header title="Health Note" showBack={false} />
              <Link to="/exercise">내 운동</Link>
            </div>
          } />
          <Route path="/exercise" element={<ExerciseListPage />} />
          <Route path="/exercise/:exerciseId" element={<ExerciseDetailPage />} />
          <Route path="/exercise/:exerciseId/edit" element={<ExerciseEditPage />} />
          <Route path="/exercise/new" element={<ExerciseCreatePage />} />
          <Route path="*" element={
            <div className={styles['home']}>
              <h1>페이지를 찾을 수 없어요.</h1>
              <Link to="/">메인으로</Link>
            </div>
          } />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
