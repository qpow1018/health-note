import HomeRoutines from '@/features/routine/homeRoutines/HomeRoutines';

import Header from '@/components/common/header/Header';

import styles from './HomePage.module.scss';

export default function HomePage() {
  return (
    <section className={styles['home-page']}>
      <Header title="홈" showBack={false} />
      <div className={styles['content']}>
        <HomeRoutines />
      </div>
    </section>
  );
}
