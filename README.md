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
npm run build
```
