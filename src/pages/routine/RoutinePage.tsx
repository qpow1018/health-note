import { Link } from 'react-router-dom';

import { loadRoutines } from '@/features/routine/routineLoader';

import Header from '@/components/common/header/Header';

import styles from './RoutinePage.module.scss';

export default function RoutinePage() {
  const { routines, error } = loadRoutines();
  return (
    <section className={styles['routine-page']}>
      <Header
        title="내 루틴 관리"
        showBack={false}
        actions={
          <Link className={styles['add-link']} to="/routine/new">
            루틴 생성
          </Link>
        }
      />
      <div className={styles['content']}>
        {error && (
          <p role="alert" className={styles['error']}>
            {error}
          </p>
        )}
        {!error && routines.length === 0 && (
          <p className={styles['message']}>아직 등록한 루틴이 없어요.</p>
        )}
        {!error && routines.length > 0 && (
          <ul className={styles['list']}>
            {routines.map((routine) => (
              <li key={routine.id}>
                <Link
                  className={styles['detail-link']}
                  to={`/routine/${encodeURIComponent(routine.id)}`}
                >
                  <h2>{routine.name}</h2>
                  <p>운동 {routine.exerciseIds.length}개</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
