---
name: following-health-note-frontend-style
description: Apply Health Note conventions when writing or changing React, TypeScript, mobile layouts, SCSS, or browser persistence in this repository.
---

# Health Note 프론트엔드 스타일

## 구조

- 앱 레이아웃·라우트 조립은 src/app/, 페이지는 src/pages/<domain>/에 둔다.
- 페이지는 URL 파라미터 해석, 화면 조립, 저장 후 이동을 담당하고 페이지 전용 스타일을 같은 폴더에 둔다.
- 운동 폼·검증·타입·저장 처리는 src/features/exercise/에 둔다. features는 공유 코드만 모으는 곳이 아니라 기능 책임을 가진 코드의 위치다.
- 페이지에서만 쓰는 JSX는 페이지 안에 유지할 수 있다. 페이지를 얇게 만들기 위해 억지로 분리하지 않는다.
- 도메인과 무관한 공용 UI는 src/components/common/에 둔다.
- 두 번째 실제 사용처가 생기고 역할까지 같을 때 공용화를 검토한다. 모양만 비슷한 코드는 강제로 합치지 않는다.
- 폴더·추상화·옵션은 필요한 시점에 추가한다.
- 폴더명은 lower camel case, 컴포넌트 파일명은 PascalCase.
- 같은 폴더나 하위 폴더 import는 ./를 허용한다. ../ 대신 src/ 기준 @/를 사용한다.

## Import

- import는 외부 라이브러리 → 내부 로직 → UI 컴포넌트 → 스타일 → 아이콘·이미지 등 시각 리소스 순으로 배치한다.
- 그룹 사이는 빈 줄 하나로 구분하고, 없는 그룹은 생략한다.
- 경로보다 가져오는 대상의 역할로 분류한다. 아이콘 라이브러리는 시각 리소스로 분류한다.
- 타입 import는 관련 대상과 같은 그룹에 두고, 같은 모듈의 import끼리 인접하게 배치한다.

## TypeScript·React

- 기본 타입 선언은 type, 타입 이름은 T 접두사, 타입 import는 import type.
- 컴포넌트와 이름 있는 헬퍼는 함수 선언식.
- 기본 내보내기 함수 컴포넌트는 `export default function ComponentName()` 형태로 선언한다.
- 컴포넌트 파일은 import, 모듈 수준 타입·상수, 대표 컴포넌트, 보조 함수·지역 컴포넌트 순으로 배치한다. 이 순서를 맞추기 위해 함수의 책임이나 스코프를 변경하지 않는다.
- boolean은 is..., 이벤트 props는 on..., 처리 함수는 handle....
- 모듈 상수는 UPPER_SNAKE_CASE, any 대신 unknown과 타입 검사.
- 조기 반환으로 중첩을 줄인다.
- Vite 앱에 Next.js 서버·클라이언트 컴포넌트 규칙을 적용하지 않는다.
- 브라우저 저장 코드는 화면과 분리해 feature에서 관리한다.

## 포맷

- `.prettierrc.json`을 기준으로 코드 작성·수정 후 변경한 코드 파일에 Prettier를 적용한다. 요청과 무관한 파일까지 일괄 포맷하지 않는다.
- 프로젝트에 설치된 Prettier를 사용하고, 변경한 파일을 대상으로 `prettier --check`를 실행한다. import 그룹 순서는 위 지침에 따라 별도로 유지한다.

## 가독성과 훅 사용

- 인라인 콜백과 effect의 정리 콜백은 화살표 함수를 기본으로 사용한다. 단순히 값을 계산하거나 JSX를 반환하면 간결하게 표현하고, 여러 책임이 섞이면 이름 있는 함수로 분리한다. 기존에 분리된 함수를 전달하는 경우에는 불필요한 콜백으로 감싸지 않는다.
- 훅 콜백에 조회·검증·오류 처리 등 서로 다른 책임이 섞이면 이름 있는 함수로 분리해 역할을 드러낸다. 단순한 한 줄 계산까지 기계적으로 분리하지 않는다.
- 여러 필드의 반환 객체와 긴 조건식을 한 줄로 압축하지 않는다.
- 같은 역할의 데이터는 목록·상세에서 일관된 방식으로 다룬다. 차이가 필요하면 조회 시점과 이유를 설명한다.
- useMemo는 성능상 필요가 있을 때 사용한다. 데이터를 보관하거나 조회 시점을 제어할 목적으로 사용하지 않는다.
- JSX의 중첩 삼항연산자를 피한다. 공통 페이지 구조를 유지하고 조건부 영역은 먼저 JSX 안에서 독립 조건으로 나눈다. 단순 값 선택의 삼항연산자는 허용한다.
- 조건이 길면 의미 있는 boolean 이름을 사용한다. 내용이 커져 읽기 어려워졌을 때만 같은 파일의 지역 컴포넌트로 분리하며, 단순 분기를 위해 렌더 함수를 미리 만들지 않는다.
- 코드 줄 수보다 동작과 데이터 흐름이 쉽게 읽히는지를 우선한다. 함수 분리 여부는 고정된 줄 수가 아니라 책임을 기준으로 판단한다.

## SCSS

- LoaM 기반 Noto Sans KR·gray 다크 테마·mint·rose 색감을 유지한다.
- 폰트는 @fontsource/noto-sans-kr 로컬 번들로 제공한다.
- 컴포넌트와 같은 PascalCase 이름의 *.module.scss를 같은 폴더에 둔다.
- styles로 import하고 kebab-case 클래스를 styles['class-name']으로 접근한다.
- HTML 구조에 맞춰 root 아래에 nesting하고 상태·modifier는 대상 아래에 둔다.
- 깊이는 고정하지 않되 불필요한 nesting을 피한다. 공용 컴포넌트 내부 스타일은 해당 컴포넌트가 관리한다.
- src/styles/reset.scss는 reset, global.scss는 폰트·body 등 전역 기본값만 관리한다.
- 기본 줄 높이는 전역에서 관리하고 필요한 요소에서 재정의할 수 있다.
- _variables.scss와 _mixins.scss는 Vite에서 전역 주입하므로 SCSS마다 @use를 반복하지 않는다.
- 주입 파일은 변수·믹스인만 제공한다. 실제 CSS를 출력하는 reset·global은 main.tsx에서 한 번 import한다.

## 레이아웃

- 모바일 전체 너비, PC 중앙 정렬 최대 너비를 사용한다.
- 콘텐츠와 fixed 요소 모두 $app-max-width 또는 app-width 믹스인을 사용한다.
- viewport 기준 fixed 요소는 같은 너비와 중앙 정렬을 함께 적용한다.
- safe area·키보드·좁은 화면·긴 텍스트를 고려한다.
- 크기·간격 토큰은 시작값이며 실제 화면을 보며 조정한다.
