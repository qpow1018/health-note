import { useState } from 'react';
import { Link } from 'react-router-dom';

import { getExercises } from '@/features/exercise/exerciseStorage';

import ButtonLink from '@/components/common/button/ButtonLink';
import Header from '@/components/common/header/Header';

import styles from './ExerciseListPage.module.scss';

import { MdAdd, MdChevronRight } from 'react-icons/md';

export default function ExerciseListPage() {
  const [result] = useState(loadExercises);
  const { exercises, error } = result;

  return (
    <section className={styles['exercise-page']}>
      <Header
        title="내 운동"
        showBack={false}
        actions={
          (error || exercises.length > 0) && (
            <ButtonLink className={styles['add-button']} to="/exercise/new">
              <MdAdd size={20} aria-hidden="true" />
              운동 추가
            </ButtonLink>
          )
        }
      />
      <div className={styles['content']}>
        {error && (
          <p role="alert" className={styles['error']}>
            {error}
          </p>
        )}
        {!error && exercises.length === 0 && (
          <div className={styles['empty']}>
            <p>아직 등록한 운동이 없어요.</p>
            <p className={styles['hint']}>운동 이름과 운동량을 자유롭게 적어보세요.</p>
            <ButtonLink className={styles['empty-add']} to="/exercise/new">
              <MdAdd size={20} aria-hidden="true" />
              운동 추가
            </ButtonLink>
          </div>
        )}
        {!error && exercises.length > 0 && (
          <>
            <div className={styles['list-toolbar']}>
              <p>총 {exercises.length}개</p>
              {exercises.length > 1 && (
                <Link to="/exercise/order" className={styles['order-link']}>
                  순서 변경
                </Link>
              )}
            </div>
            <ul className={styles['list']}>
              {exercises.map((exercise) => (
                <li key={exercise.id} className={styles['item']}>
                  <Link
                    className={styles['detail-link']}
                    to={`/exercise/${encodeURIComponent(exercise.id)}`}
                  >
                    <div className={styles['info']}>
                      <h2>{exercise.name}</h2>
                      <p>
                        {exercise.amount || (exercise.sets === null ? '-' : '')}
                        {exercise.amount && exercise.sets !== null && ' × '}
                        {exercise.sets !== null && `${exercise.sets}세트`}
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

function loadExercises() {
  try {
    return {
      exercises: getExercises(),
      error: '',
    };
  } catch {
    return {
      exercises: [],
      error: '운동 목록을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.',
    };
  }
}
