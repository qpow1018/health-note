import HomeRoutines from '@/features/routine/homeRoutines/HomeRoutines';

import styles from './HomePage.module.scss';

export default function HomePage() {
  return (
    <section className={styles['home-page']}>
      <header className={styles['header']}>
        <h1 className={styles['logo']}>
          <img src="/brand/health-note.svg" alt="" width="32" height="32" />
          <span>헬스노트</span>
        </h1>
      </header>
      <div className={styles['content']}>
        <HomeRoutines />
      </div>
    </section>
  );
}
