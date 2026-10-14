# Health Note

- React 19 + TypeScript + Vite 모바일 웹 프로젝트이며 npm과 package-lock.json을 사용한다.
- 프론트엔드 작성·수정에는 [following-health-note-frontend-style](.agents/skills/following-health-note-frontend-style/SKILL.md)을 적용한다.
- 현재 운동 등록·목록·상세·수정·삭제와 브라우저 저장을 제공한다. 네이티브 연동은 해당 구현 요청에 맞춰 추가한다.
- 새 기능을 위한 빈 폴더, 미사용 옵션, 추상화를 미리 만들지 않는다.

## 검증

- 코드 변경: npm run lint, npm run typecheck.
- 환경·의존성·빌드 설정 변경: npm run build도 실행한다.
- 화면·인터랙션 변경: PC의 모바일 폭에서 확인하고, 주요 흐름은 Android에서도 확인한다.
- 저장·계산 로직은 의미 있는 실패 동작을 중심으로 검증하며 테스트 도구는 필요해질 때 추가한다.
- 검증하지 못한 항목과 이유를 명시한다.
