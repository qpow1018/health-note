import { Link } from 'react-router-dom';

import { useRoutines } from '@/features/routine/routineLoader';

import ButtonLink from '@/components/common/button/ButtonLink';
import Header from '@/components/common/header/Header';

import styles from './RoutinePage.module.scss';

import { MdAdd, MdChevronRight } from 'react-icons/md';

export default function RoutinePage() {
  const { routines, error, isLoading, refetch } = useRoutines();

  return (
    <section className={styles['routine-page']}>
      <Header
        title="내 루틴 관리"
        showBack={false}
        actions={
          (error || routines.length > 0) && (
            <ButtonLink className={styles['add-button']} to="/routine/new">
              <MdAdd size={20} aria-hidden="true" />
              루틴 생성
            </ButtonLink>
          )
        }
      />
      <div className={styles['content']}>
        {isLoading && <p role="status">루틴을 불러오고 있어요.</p>}
        {error && (
          <button type="button" onClick={() => void refetch()}>
            다시 시도
          </button>
        )}
        {error && (
          <p role="alert" className={styles['error']}>
            {error}
          </p>
        )}
        {!isLoading && !error && routines.length === 0 && (
          <div className={styles['empty']}>
            <p>아직 등록한 루틴이 없어요.</p>
            <p className={styles['hint']}>운동을 묶어 나만의 반복 일정을 만들어보세요.</p>
            <ButtonLink className={styles['empty-add']} to="/routine/new">
              <MdAdd size={20} aria-hidden="true" />
              루틴 생성
            </ButtonLink>
          </div>
        )}
        {!isLoading && !error && routines.length > 0 && (
          <>
            <div className={styles['list-toolbar']}>
              <p>총 {routines.length}개</p>
              {routines.length > 1 && (
                <Link to="/routine/order" className={styles['order-link']}>
                  순서 변경
                </Link>
              )}
            </div>
            <ul className={styles['list']}>
              {routines.map((routine) => (
                <li key={routine.id} className={styles['item']}>
                  <Link
                    className={styles['detail-link']}
                    to={`/routine/${encodeURIComponent(routine.id)}`}
                  >
                    <div className={styles['info']}>
                      <h2>{routine.name}</h2>
                      <p>
                        <span className={routine.isActive ? styles['active-status'] : undefined}>
                          {routine.isActive ? '활성' : '비활성'}
                        </span>
                        {' · '}운동 {routine.exerciseIds.length}개
                      </p>
                    </div>
                    <MdChevronRight className={styles['chevron']} size={20} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
