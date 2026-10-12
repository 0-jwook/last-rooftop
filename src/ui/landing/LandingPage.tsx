import { useState } from 'react';
import { hasSaveGame, resetGame } from '../../game/save/storage';
import { ConfirmDialog } from '../common/ConfirmDialog';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onStart: () => void;
}

const SKYLINE_BARS = [36, 64, 48, 84, 32, 56, 76, 40, 60, 46];

const FEATURES = [
  { title: '탐사', desc: '편의점, 아파트, 약국을 돌아보며 물자를 구한다.' },
  { title: '건설', desc: '텐트, 텃밭, 태양광 발전기로 옥상을 채워간다.' },
  { title: '생활', desc: '먹고, 마시고, 자며 하루하루를 버틴다.' },
  { title: '일기', desc: '그날 겪은 일이 자동으로 기록된다.' },
];

export function LandingPage({ onStart }: LandingPageProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const continuable = hasSaveGame();

  function startFresh() {
    resetGame();
    onStart();
  }

  return (
    <div className={styles.page}>
      <div className={styles.sky} aria-hidden="true">
        <div className={styles.sun} />
        <div className={styles.skyline}>
          {SKYLINE_BARS.map((height, index) => (
            <span key={index} className={styles.bar} style={{ height: `${height}px` }} />
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>생존 · 정착 · 탐험</p>
        <h1 className={styles.title}>마지막 옥상</h1>
        <p className={styles.tagline}>세상이 무너진 뒤에도, 해는 진다.</p>

        <p className={styles.lead}>
          좀비 사태로 도시가 무너진 어느 날, 주인공은 작은 옥상에 도착한다. 전투가 아니라
          생존과 정착, 그리고 풍경을 감상하는 것이 이 게임의 전부다. 탐사를 나가지 않고
          조용히 하루를 보내는 것도 완전히 유효한 선택이다.
        </p>

        <ul className={styles.features}>
          {FEATURES.map((feature) => (
            <li key={feature.title} className={styles.featureItem}>
              <span className={styles.featureTitle}>{feature.title}</span>
              <span className={styles.featureDesc}>{feature.desc}</span>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {continuable ? (
            <>
              <button className={styles.primary} onClick={onStart}>
                이어하기
              </button>
              <button className={styles.secondary} onClick={() => setConfirmOpen(true)}>
                새로 시작
              </button>
            </>
          ) : (
            <button className={styles.primary} onClick={onStart}>
              시작하기
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="새로 시작할까요?"
        message="기존에 이어하던 진행 상황이 모두 사라지고 처음부터 다시 시작합니다."
        onConfirm={() => {
          setConfirmOpen(false);
          startFresh();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
