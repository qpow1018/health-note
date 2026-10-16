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

## 개발·운영 Supabase 분리

| 환경           | Supabase                        | 환경 파일                                     |
| -------------- | ------------------------------- | --------------------------------------------- |
| 로컬 개발      | Docker의 `health-note-local`    | `.env.development.local`                      |
| 운영 빌드·배포 | 클라우드 `scehcbhewfztqfhxgpsh` | `.env.production.local` 또는 호스팅 환경 변수 |

구글 로그인 후에만 앱 화면에 진입할 수 있습니다. 운동·루틴·완료 상태는 아직 계정별 localStorage에 저장되며, DB 저장·기기 간 연동은 다음 단계입니다. 로그인 세션은 Supabase SDK가 유지합니다.

### 로컬 실행

Docker Desktop을 실행한 뒤, 처음 한 번만 로컬 전용 네트워크를 만듭니다.

```sh
npm run db:network
```

네트워크는 `127.0.0.1` 바인딩 옵션을 사용합니다. 다만 macOS Docker Desktop에서는 이 옵션만으로 제한되지 않는 현상이 있어 **Settings → Resources → Network → Port binding behavior → Localhost by default** 설정도 필요합니다. 이는 Docker 전체 설정이므로 직접 변경합니다. 이 PC에서는 설정 변경 후 재시작하여 API·DB·Studio의 실제 macOS 수신 주소가 모두 `127.0.0.1`임을 확인했습니다. [관련 Supabase 이슈](https://github.com/supabase/supabase/issues/51027)

다른 프로젝트의 Supabase와 충돌하지 않도록 Health Note는 별도 이름과 5532x 포트를 사용합니다.

```sh
npm run db:start
npm run db:status
cp .env.example .env.development.local
```

실행 후 `docker ps --filter label=com.supabase.cli.project=health-note-local --format '{{.Names}} {{.Ports}}'`에서 호스트 포트가 `127.0.0.1`인지 확인합니다. Docker가 IPv6 `[::]`도 함께 표시할 수 있으므로 macOS에서는 `lsof -nP -iTCP:55321 -iTCP:55322 -iTCP:55323 -sTCP:LISTEN`으로 실제 수신 주소를 확인합니다. 실제 수신 주소가 `*`라면 바인딩 설정을 다시 확인하고 재시작합니다.

`.env.development.local`의 공개 키를 `db:status`에 표시되는 로컬 Publishable key로 바꿉니다. 로컬 환경에서 Publishable key가 표시되지 않는 경우 로컬 anon key를 사용할 수 있습니다. Secret key와 service_role key는 넣지 않습니다. 이 PC에는 실행 검증 후 로컬 환경 파일이 작성되어 있습니다.

- 데이터 API: `http://127.0.0.1:55321`
- PostgreSQL: `127.0.0.1:55322`
- 로컬 관리 화면(Studio): `http://127.0.0.1:55323`
- 앱: `npm run dev` → `http://localhost:5173`

종료할 때는 `npm run db:stop`을 실행합니다. 이 명령은 Health Note 컨테이너만 종료하고 데이터를 보존합니다. 데이터 삭제 옵션과 전체 프로젝트 종료 옵션은 사용하지 않습니다.

### 로컬 구글 로그인

클라우드에서 활성화한 Google 설정은 로컬 Supabase에 자동 반영되지 않습니다. 초기 설정에서는 로컬 Google 제공자를 비활성화해 두었습니다. 실제 로그인을 테스트하려면 다음 설정을 진행합니다.

1. Google OAuth 웹 클라이언트의 승인된 리디렉션 URI에 `http://127.0.0.1:55321/auth/v1/callback`을 추가합니다. 기존 클라우드 콜백 주소는 유지합니다. Google 앱이 테스트 상태이면 로그인할 계정을 테스트 사용자로 등록합니다.
2. `supabase/.env.example`을 저장소 루트의 `.env`로 복사하고 Client ID와 Secret을 입력합니다. `.env`는 Git에서 제외되며, 이 값에는 `VITE_` 접두사를 붙이지 않습니다.
3. `supabase/config.toml`의 `[auth.external.google]`에서 `enabled = true`로 바꿉니다.
4. `npm run db:stop` 후 `npm run db:start`로 재시작합니다.

앱은 PKCE 방식으로 구글 로그인을 시작하고 현재 origin의 `/`로 복귀합니다. `localhost:5173`, `127.0.0.1:5173`, E2E용 `127.0.0.1:4173`가 로컬 복귀 주소입니다. 운영에서는 Supabase 대시보드의 URL Configuration에도 실제 운영 origin의 `/`를 등록합니다. 로그인 취소·실패는 로그인 화면에서 안내하고 다시 시도할 수 있습니다. 홈 오른쪽의 로그아웃은 현재 세션만 종료합니다.

### 운영 설정

이 PC의 기존 클라우드 URL·공개 키는 `.env.local`에서 `.env.production.local`로 이동했습니다. 다른 PC에서는 `.env.production.example`을 `.env.production.local`로 복사하고 운영 공개 키를 입력합니다.

호스팅에서는 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 **Production 환경에만** 설정합니다. `npm run build`는 production 모드이고, `npm run dev`는 development 모드입니다. 환경 파일을 바꾸면 Vite를 재시작합니다. 모든 모드에서 읽는 `.env.local`에는 Supabase 연결 값을 넣지 않습니다.

개발 모드에서 클라우드 주소를 사용하거나 운영 모드에서 로컬 주소를 사용하면 Vite 설정이 오류를 표시합니다. 미리보기 배포는 Docker의 localhost에 접근할 수 없으므로, DB 연동 테스트가 필요해지면 별도 클라우드 개발 프로젝트를 연결합니다. 운영 프로젝트를 미리보기용으로 공유하지 않습니다.

현재 `supabase/schema.sql`은 적용되지 않은 설계 초안입니다. 로컬 시작 시 실행되지 않습니다. 실제 테이블·RLS 도입 시 CLI의 `supabase migration new`로 마이그레이션을 만들고 로컬에서 검증한 뒤 운영에 적용합니다. 운영 DB의 변경·배포·데이터 이전은 이번 환경 설정에 포함하지 않습니다.

공식 참고: [Supabase 로컬 개발](https://supabase.com/docs/guides/local-development), [로컬 비밀 설정](https://supabase.com/docs/guides/local-development/managing-config), [Vite 환경 파일](https://vite.dev/guide/env-and-mode).

같은 Wi-Fi의 Android 휴대폰에서 확인하려면 아래 명령으로 실행하고 출력된 Network 주소에 접속합니다.

```sh
npm run dev -- --host 0.0.0.0
```

위 명령은 현재 화면 확인용입니다. 로컬 Supabase는 PC의 loopback에만 공개하므로, Android에서 DB까지 연결하려면 USB 포트 전달 등 별도 구성이 필요합니다.

## 검증

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

E2E 테스트는 설치된 Google Chrome이 필요합니다.
모바일 폭의 PC 브라우저에서 실행하며, Android 실기기의 키보드·터치 등은 별도로 확인해야 합니다.
자동 테스트는 격리된 브라우저와 모의 Supabase Auth 응답을 사용합니다. 실제 Google 동의 화면과 자격 증명·콜백 설정은 별도로 확인해야 합니다.

## 저장과 배포

- 기록은 현재 브라우저의 계정별 localStorage에 저장됩니다. 기기·브라우저 간 동기화는 아직 제공하지 않습니다.
- 기존 비로그인 기록은 로그인 계정으로 가져오거나 삭제하지 않습니다. 새 계정은 빈 상태로 시작합니다.
- 이 계정 구분은 DB 전환 전의 임시 처리입니다. 실제 서버 데이터 접근 권한은 DB 전환 때 RLS로 제한합니다.
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
