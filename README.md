# Health Note

내 방식대로 운동 이름과 운동량·세트를 정하고, 유튜브 링크와 메모를 함께 관리하는 모바일 웹앱입니다.
운동 등록·목록·상세·수정·삭제를 지원합니다.

React 19, TypeScript, Vite, React Router, SCSS Modules를 사용합니다.

## 실행

Node.js 22.23.3과 npm을 사용합니다. nvm을 사용한다면 `.nvmrc`로 버전을 맞출 수 있습니다.

```sh
nvm use
npm ci
npm run dev
```

같은 Wi-Fi의 Android 휴대폰에서 확인하려면 아래 명령으로 실행하고 출력된 Network 주소에 접속합니다.

```sh
npm run dev -- --host 0.0.0.0
```

## 검증

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

E2E 테스트는 설치된 Google Chrome이 필요합니다.
모바일 폭의 PC 브라우저에서 실행하며, Android 실기기의 키보드·터치 등은 별도로 확인해야 합니다.

## 저장과 배포

- 기록은 현재 브라우저의 localStorage에 저장됩니다. 기기·브라우저 간 동기화는 제공하지 않습니다.
- 브라우저 데이터를 삭제하면 기록도 사라집니다. 같은 브라우저라도 접속 주소의 origin이 달라지면 저장소가 분리됩니다.
- 운동 삭제는 복구할 수 없습니다.
- BrowserRouter를 사용하므로 배포 환경에 SPA fallback을 설정해야 합니다. `/exercise` 같은 페이지 경로에 직접 접속해도 `index.html`을 반환해야 합니다.

## 코드 구조

- `src/app/`: 앱 레이아웃과 라우트 조립
- `src/pages/`: 페이지와 페이지 전용 스타일
- `src/features/exercise/`: 운동 폼·타입·조회·저장·검증
- `src/components/common/`: 공용 UI
- `src/styles/`: 폰트·다크 테마·공통 토큰·전역 스타일

작성 규칙은 [AGENTS.md](./AGENTS.md)와 연결된 프로젝트 스킬을 참고합니다.
