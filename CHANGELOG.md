# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Code Quality 스킬 완성 (SOLID 원칙 검사)
- Zod Validation 스킬 완성
- 테스트 커버리지 추가
- 영문 문서화

## [0.1.1] - 2025-12-11

### Changed
- **마켓플레이스 설정 업데이트**
  - 마켓플레이스 이름을 `frontend-dev-toolkit`에서 `dan`으로 변경
  - 설치 명령어 간소화: `/plugin install frontend-dev-toolkit@dan`
  - marketplace.json 구조 최적화 (Claude Code 공식 문서 기준 준수)

### Fixed
- README.md의 설치 및 업데이트 명령어 수정
- 마켓플레이스 참조 일관성 개선

## [0.1.0] - 2025-12-11

### Added
- **FSD Architecture 스킬**
  - `/fsd-init`: FSD 프로젝트 구조 자동 초기화
  - `/fsd-slice`: entity, feature, widget 슬라이스 자동 생성
  - `/fsd-validate`: FSD 아키텍처 규칙 검증
  - 레이어 의존성 검증 (app → pages → widgets → features → entities → shared)
  - Public API (index.ts) 강제 패턴

- **React Query Patterns 스킬**
  - `/rq-setup`: React Query 프로젝트 설정
  - `/rq-entity`: Entity용 Query 패턴 생성
  - queryOptions 팩토리 패턴
  - queryKeyFactory 계층 구조
  - useSuspenseQuery 기반 커스텀 훅
  - FSD entities 레이어 통합

- **Code Quality 스킬 (기본)**
  - `/quality-check`: 코드 퀄리티 분석
  - SOLID 원칙 검사 기반
  - 컴포넌트 분석 (크기, 복잡도)
  - TypeScript 타입 체크

- **Zod Validation 스킬 (기본)**
  - `/validate-schema`: Zod 스키마 검증
  - API 응답 스키마 패턴
  - 폼 검증 스키마 패턴

- **Documentation**
  - 한글 README 완성
  - 사용 예시 및 베스트 프랙티스
  - FSD 아키텍처 가이드
  - React Query 패턴 가이드

- **Infrastructure**
  - Claude Code 플러그인 구조
  - Skills 자동 활성화
  - Slash Commands
  - Bun 패키지 관리
  - 버전 관리 스크립트

### Configuration
- FSD strictMode 기본 활성화
- React Query Suspense 우선
- TypeScript strict 모드 권장
- 코드 퀄리티 기준 설정

---

## Version History

- **0.1.0** (2025-12-11): Initial release - FSD Architecture + React Query Patterns
