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

| 환경           | Supabase                        | 환경 파일                               |
| -------------- | ------------------------------- | --------------------------------------- |
| 로컬 개발      | Docker의 `health-note-local`    | `.env.development`                      |
| 운영 빌드·배포 | 클라우드 `scehcbhewfztqfhxgpsh` | `.env.production` 또는 호스팅 환경 변수 |

구글 로그인 후에만 앱 화면에 진입할 수 있습니다. 운동·루틴·완료 기록은 Supabase DB에 저장하고 RLS로 로그인한 사용자의 데이터만 접근하도록 제한합니다. 로그인 세션은 Supabase SDK가 유지합니다.

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
npm run db:migrate
```

실행 후 `docker ps --filter label=com.supabase.cli.project=health-note-local --format '{{.Names}} {{.Ports}}'`에서 호스트 포트가 `127.0.0.1`인지 확인합니다. Docker가 IPv6 `[::]`도 함께 표시할 수 있으므로 macOS에서는 `lsof -nP -iTCP:55321 -iTCP:55322 -iTCP:55323 -sTCP:LISTEN`으로 실제 수신 주소를 확인합니다. 실제 수신 주소가 `*`라면 바인딩 설정을 다시 확인하고 재시작합니다.

`.env.development`를 아래 형태로 작성하고 공개 키를 `db:status`에 표시되는 로컬 Publishable key로 바꿉니다. 로컬 환경에서 Publishable key가 표시되지 않는 경우 로컬 anon key를 사용할 수 있습니다. Secret key와 service_role key는 넣지 않습니다. 이 PC에는 실행 검증 후 로컬 환경 파일이 작성되어 있습니다.

```dotenv
VITE_SUPABASE_URL=http://127.0.0.1:55321
VITE_SUPABASE_PUBLISHABLE_KEY=your_local_publishable_key
```

- 데이터 API: `http://127.0.0.1:55321`
- PostgreSQL: `127.0.0.1:55322`
- 로컬 관리 화면(Studio): `http://127.0.0.1:55323`
- 앱: `npm run dev` → `http://localhost:5173`

종료할 때는 `npm run db:stop`을 실행합니다. 이 명령은 Health Note 컨테이너만 종료하고 데이터를 보존합니다. 데이터 삭제 옵션과 전체 프로젝트 종료 옵션은 사용하지 않습니다.

### 로컬 구글 로그인

클라우드에서 활성화한 Google 설정은 로컬 Supabase에 자동 반영되지 않습니다. 로컬 Google 제공자는 활성화되어 있으므로 실행 전에 다음 자격 증명을 준비합니다.

1. Google OAuth 웹 클라이언트의 승인된 리디렉션 URI에 `http://127.0.0.1:55321/auth/v1/callback`을 추가합니다. 기존 클라우드 콜백 주소는 유지합니다. Google 앱이 테스트 상태이면 로그인할 계정을 테스트 사용자로 등록합니다.
2. `supabase/.env.example`을 저장소 루트의 `.env`로 복사하고 Client ID와 Secret을 입력합니다. `.env`는 Git에서 제외되며, 이 값에는 `VITE_` 접두사를 붙이지 않습니다.
3. `npm run db:stop` 후 `npm run db:start`로 재시작합니다.

앱은 PKCE 방식으로 구글 로그인을 시작하고 현재 origin의 `/`로 복귀합니다. `localhost:5173`, `127.0.0.1:5173`, E2E용 `127.0.0.1:4173`가 로컬 복귀 주소입니다. 운영에서는 Supabase 대시보드의 URL Configuration에도 실제 운영 origin의 `/`를 등록합니다. 로그인 취소·실패는 로그인 화면에서 안내하고 다시 시도할 수 있습니다. 홈 오른쪽의 로그아웃은 현재 세션만 종료합니다.

### 운영 설정

운영 주소는 [health-note-six.vercel.app](https://health-note-six.vercel.app/)입니다. Vercel은 `main` 브랜치를 Production으로 배포하며, 현재 반영한 앱 커밋은 `7ad5d5e`입니다.

`.env.production`에는 운영 프로젝트의 URL과 공개 키를 같은 변수명으로 입력합니다. `.env.development`, `.env.production`, 서버용 Google 자격 증명의 `.env`는 모두 Git에서 제외합니다.

호스팅에서는 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 **Production 환경에만** 설정합니다. `npm run build`는 production 모드이고, `npm run dev`는 development 모드입니다. 환경 파일을 바꾸면 Vite를 재시작합니다. 모든 모드에서 읽는 `.env.local`에는 Supabase 연결 값을 넣지 않습니다.

운영 Supabase의 Site URL은 `https://health-note-six.vercel.app`, 허용 Redirect URL은 `https://health-note-six.vercel.app/`로 설정했습니다. Google 로그인 후 운영 홈으로 돌아오는 것을 확인했습니다.

개발 모드에서 클라우드 주소를 사용하거나 운영 모드에서 로컬 주소를 사용하면 Vite 설정이 오류를 표시합니다. 미리보기 배포는 Docker의 localhost에 접근할 수 없으므로, DB 연동 테스트가 필요해지면 별도 클라우드 개발 프로젝트를 연결합니다. 운영 프로젝트를 미리보기용으로 공유하지 않습니다.

`supabase/migrations/`의 운동·루틴·완료 기록 테이블과 RLS·원자적 저장·순서 변경 함수가 실제 적용 대상입니다. `npm run db:migrate`는 로컬 DB에만 적용합니다. `supabase/schema.sql`은 미적용 설계 초안이며 실제 스키마의 기준이 아닙니다. 2026-10-16 운영 프로젝트에도 세 마이그레이션을 적용했습니다. 운영과 로컬의 마이그레이션 버전은 동일하며, 운영 적용 이후에는 새 변경을 별도 마이그레이션으로 추가합니다.

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
npm run db:test
```

E2E 테스트는 설치된 Google Chrome이 필요합니다.
모바일 폭의 PC 브라우저에서 실행하며, Android 실기기의 키보드·터치 등은 별도로 확인해야 합니다.
브라우저 자동 테스트는 격리된 브라우저와 모의 Supabase Auth·운동·루틴·완료 기록 API 응답을 사용합니다. `db:test`는 실행 중인 로컬 DB에서 pgTAP으로 사용자 간 접근 차단, 버전 충돌, 원자적 순서 변경, 완료 기록의 중복 방지와 보존을 검증하며 테스트 데이터는 롤백합니다. 실제 Google 동의 화면과 자격 증명·콜백 설정은 별도로 확인해야 합니다.

## 저장과 배포

- 운동·루틴·완료 기록은 계정별 DB에 저장됩니다. 같은 Supabase 프로젝트에 연결한 기기에서는 같은 계정의 기록을 조회할 수 있습니다.
- 완료 기록은 사용자·루틴·날짜·운동별로 저장합니다. 홈 진입·새로고침·화면 복귀 시 재조회하며 실시간 구독은 사용하지 않습니다. 저장 응답을 기다리는 동안 체크를 잠시 막고, 실패하면 기존 표시를 유지합니다.
- 기존 브라우저 운동·루틴·완료 기록은 DB에 자동 업로드하거나 삭제하지 않습니다. DB는 빈 상태로 시작합니다.
- 브라우저 데이터를 지워도 DB 기록은 남습니다. 로그인 세션이 지워지면 다시 로그인합니다.
- 루틴에서 운동을 제외해도 기존 완료 기록은 남고 현재 진행률 계산에서는 제외합니다. 루틴이나 운동 자체를 삭제하면 관련 완료 기록도 삭제합니다.
- 루틴에 포함된 운동은 DB의 외래 키로 삭제를 막습니다. 다른 기기의 루틴도 같은 제한을 적용합니다. 루틴의 운동 연결은 순서를 포함해 한 트랜잭션에서 저장하며, 실패하면 전체를 롤백합니다.
- 운동 삭제는 복구할 수 없습니다.
- BrowserRouter를 사용하므로 배포 환경에 SPA fallback을 설정해야 합니다. `/exercise` 같은 페이지 경로에 직접 접속해도 `index.html`을 반환해야 합니다.

## 코드 구조

- `src/app/`: 앱 레이아웃과 라우트 조립
- `src/pages/`: 페이지와 페이지 전용 스타일
- `src/features/exercise/`: 운동 폼·타입·조회·저장·검증
- `src/components/common/`: 공용 UI
- `src/styles/`: 폰트·다크 테마·공통 토큰·전역 스타일

작성 규칙은 [AGENTS.md](./AGENTS.md)와 연결된 프로젝트 스킬을 참고합니다.
