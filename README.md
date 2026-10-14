# Health Note

React 19 + TypeScript + Vite 기반 모바일 웹 프로젝트입니다.
현재는 개발 환경만 구성했으며 운동 CRUD, 저장, 네이티브 연동은 구현하지 않았습니다.

## 실행

Node.js 22.23.3과 npm을 사용합니다.

```sh
nvm use
npm ci
npm run dev
```

같은 Wi-Fi의 Android 휴대폰에서 확인하려면 다음 명령으로 실행하고 출력된 Network 주소에 접속합니다.

```sh
npm run dev -- --host 0.0.0.0
```

## 검증

```sh
npm run lint
npm run typecheck
npm run build
```

## 스타일 기반

Noto Sans KR 로컬 폰트, LoaM 기반 다크 팔레트, SCSS Modules를 사용합니다.
공통 토큰은 `src/styles/_variables.scss`에서 관리합니다.
Sass 변수·믹스인은 전역 주입하고 `@/`는 `src/`를 가리킵니다.
앱과 fixed 요소는 `$app-max-width`를 공유합니다.
코드 규칙은 `AGENTS.md`와 연결된 프론트엔드 스킬을 참고합니다.
