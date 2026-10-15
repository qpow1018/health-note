import { useState } from 'react';
import { Link } from 'react-router-dom';

import { getRoutines } from '@/features/routine/routineStorage';

import Header from '@/components/common/header/Header';

import styles from './RoutinePage.module.scss';

export default function RoutinePage() {
  const [{ routines, error }] = useState(loadRoutines);
  return (
    <section className={styles['routine-page']}>
      <Header
        title="루틴"
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

function loadRoutines() {
  try {
    return { routines: getRoutines(), error: '' };
  } catch {
    return {
      routines: [],
      error: '루틴 목록을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
    };
  }
}
