# Frontend Dev Toolkit - Claude Code Plugin

프론트엔드 개발을 위한 종합 툴킷: FSD 아키텍처, React Query 패턴, 코드 퀄리티 검사를 자동화하는 Claude Code 플러그인

## 주요 기능

### 🏗️ FSD Architecture
- **자동 슬라이스 생성**: entity, feature, widget 구조를 템플릿 기반으로 자동 생성
- **의존성 검증**: 레이어 간 의존성 규칙 자동 체크 (app → pages → widgets → features → entities → shared)
- **Public API 관리**: index.ts를 통한 공개 인터페이스 강제
- **구조 검증**: FSD 아키텍처 규칙 준수 여부 확인

### ⚡ React Query Patterns
- **queryOptions 팩토리**: 재사용 가능한 쿼리 정의 자동 생성
- **queryKeyFactory**: 계층적 쿼리 키 관리 패턴
- **커스텀 훅**: useSuspenseQuery 래핑으로 선언적 데이터 페칭
- **Mutation 패턴**: 낙관적 업데이트와 에러 핸들링 포함
- **FSD 통합**: entities 레이어에 api 구조 자동 생성

### ✅ Code Quality
- **SOLID 원칙**: SRP, DIP 등 SOLID 원칙 위반 탐지
- **컴포넌트 분석**: 추상화 레벨, 응집도/결합도 분석
- **TypeScript 검사**: any 사용, 타입 단언 남용 탐지
- **리팩토링 제안**: 코드 스멜 식별 및 개선 방안 제시

### 🔍 Code Smell Detection (NEW)
- **Frontend Fundamentals 기반**: Toss 프론트엔드 코드 품질 가이드 적용
- **4대 원칙 검사**: 가독성, 예측 가능성, 응집도, 결합도
- **Before/After 예시**: 구체적인 개선 코드 제공
- **우선순위 제안**: 심각도에 따른 개선 순서 제시

### 🛡️ Zod Validation
- **API 스키마**: DTO를 도메인 모델로 변환하는 스키마 자동 생성
- **폼 검증**: React Hook Form + Zod 통합 패턴
- **타입 안전성**: 런타임 검증과 타입 추론 동시 제공

## 사용 방법

### 자동 모드 (Skills)

플러그인이 설치되면 Claude Code가 컨텍스트에 따라 자동으로 스킬을 활성화합니다:

```
사용자: "user entity를 FSD 구조로 만들어줘"
→ FSD Architecture 스킬 자동 활성화
→ entity 슬라이스 자동 생성 (React Query 통합)
```

```
사용자: "이 컴포넌트 코드 리뷰해줘"
→ Code Quality 스킬 자동 활성화
→ SOLID 원칙, 추상화 레벨 분석
```

### 수동 모드 (Commands)

명시적으로 슬래시 커맨드를 사용할 수도 있습니다:

```bash
/fsd-init              # FSD 프로젝트 구조 초기화
/fsd-slice             # 새 슬라이스 생성
/fsd-validate          # FSD 구조 검증
/rq-setup              # React Query 설정
/rq-entity             # Entity용 Query 생성
/quality-check         # 코드 퀄리티 검사
/code-smell            # 코드 스멜 탐지 (Frontend Fundamentals 기반)
/validate-schema       # Zod 스키마 검증
```

## 설치 방법

### 마켓플레이스에서 설치 (권장)

Claude Code에서 GitHub 저장소를 통해 직접 설치:

```bash
# 마켓플레이스 추가
/plugin marketplace add geonhwiii/frontend-dev-toolkit

# 플러그인 설치
/plugin install frontend-dev-toolkit@dan
```

또는 저장소 URL로 직접 추가:

```bash
/plugin marketplace add https://github.com/geonhwiii/frontend-dev-toolkit.git
/plugin install frontend-dev-toolkit@dan
```

### 로컬 개발용

```bash
git clone https://github.com/geonhwiii/frontend-dev-toolkit.git
cd frontend-dev-toolkit

# Claude Code에서 로컬 플러그인 추가
/plugin install ./frontend-dev-toolkit
```

### 업데이트

```bash
# 마켓플레이스 업데이트
/plugin marketplace update dan

# 플러그인 재설치
/plugin install frontend-dev-toolkit@dan
```

## 빠른 시작

### 1. FSD 프로젝트 초기화

```bash
/fsd-init
```

다음 구조가 생성됩니다:

```
src/
├── app/
│   ├── providers/
│   └── index.tsx
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
    ├── api/
    ├── ui/
    └── lib/
```

### 2. Entity 슬라이스 생성 (React Query 통합)

```bash
/fsd-slice
# Layer: entity
# Name: user
# Segments: ui, api, model
```

생성되는 구조:

```
entities/user/
├── index.ts                    # Public API
├── model/
│   ├── types.ts               # User 타입 정의
│   └── index.ts
├── api/
│   ├── user.queries.ts        # queryOptions 팩토리
│   ├── user.keys.ts           # Query key 팩토리
│   ├── user.api.ts            # API 함수들
│   └── index.ts
└── ui/
    ├── UserCard.tsx           # UI 컴포넌트
    └── index.ts
```

### 3. 코드 퀄리티 검사

```bash
/quality-check
# File: src/features/auth/ui/LoginForm.tsx
```

분석 결과:

```
📊 Code Quality Report
======================

Metrics:
- Component size: 180 lines ✅
- Cohesion score: 0.72 ✅
- TypeScript coverage: 98% ✅

⚠️ Issues:
1. SRP violation (lines 45-80)
   → Extract useLoginForm hook
2. Type assertion at line 67
   → Add proper type guard

✅ Good Practices:
- Consistent abstraction levels
- Good use of custom hooks
```

## FSD 아키텍처 규칙

### 레이어 의존성

```
app → pages → widgets → features → entities → shared
(상위 레이어는 하위 레이어만 import 가능)
```

### 각 레이어의 책임

- **app**: 라우팅, 전역 Provider, 앱 초기화
- **pages**: 페이지 단위 컴포넌트
- **widgets**: 독립적인 대형 UI 블록
- **features**: 재사용 가능한 비즈니스 기능
- **entities**: 핵심 도메인 모델 (user, product 등)
- **shared**: 범용 유틸리티 및 컴포넌트

### Public API 규칙

각 슬라이스는 `index.ts`를 통해서만 export:

```typescript
// ✅ Good
import { User } from '@/entities/user';
import { useUser } from '@/entities/user';

// ❌ Bad
import { User } from '@/entities/user/model/types';
```

## React Query 패턴

### queryKeyFactory

```typescript
// entities/user/api/user.keys.ts
export const userKeys = {
  all: ['user'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

### queryOptions Factory

```typescript
// entities/user/api/user.queries.ts
export const userQueries = {
  all: () => queryOptions({
    queryKey: userKeys.all,
    queryFn: userApi.getAll,
  }),
  detail: (id: string) => queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
  }),
};
```

### Custom Hook (Suspense)

```typescript
// features/user-profile/api/useUserProfile.ts
export function useUserProfile(id: string) {
  return useSuspenseQuery(userQueries.detail(id));
}
```

### 사용 예시 (Suspense + ErrorBoundary)

```typescript
function UserProfile({ userId }: { userId: string }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfileContent userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function UserProfileContent({ userId }: { userId: string }) {
  const { data: user } = useUserProfile(userId);
  return <div>{user.name}</div>;
}
```

## 코드 퀄리티 체크리스트

### SOLID 원칙

#### Single Responsibility Principle (SRP)

```typescript
// ❌ Bad: Multiple responsibilities
function UserProfile() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch('/api/user').then(res => setUser(res.json()));
  }, []);

  const validateEmail = (email) => /^.../.test(email);

  return <div>...</div>;
}

// ✅ Good: Separated responsibilities
function useUser() {
  return useSuspenseQuery(userQueries.current());
}

function UserProfile() {
  const { data: user } = useUser();
  return <div>...</div>;
}
```

#### Dependency Inversion Principle (DIP)

```typescript
// ❌ Bad: Direct dependency
function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('/api/users').then(res => setUsers(res.json()));
  }, []);
  return <div>...</div>;
}

// ✅ Good: Depends on abstraction
function UserList() {
  const { data: users } = useUsers();  // Hook abstraction
  return <div>...</div>;
}
```

### TypeScript 베스트 프랙티스

```typescript
// ❌ Bad: any usage
const data: any = await fetch('/api/user');

// ✅ Good: Proper typing
const data: User = await apiClient.get<User>('/api/user');

// ❌ Bad: Excessive type assertion
const name = (user.name as string).toUpperCase();

// ✅ Good: Proper typing
const name = user.name.toUpperCase();  // user.name is already string
```

## 구성 옵션

플러그인 설정은 `.claude-plugin/plugin.json`에서 커스터마이징 가능:

```json
{
  "configuration": {
    "fsd": {
      "strictMode": true,
      "allowedLayers": ["app", "pages", "widgets", "features", "entities", "shared"],
      "enforcePublicApi": true
    },
    "reactQuery": {
      "preferSuspense": true,
      "enforceQueryKeyFactory": true
    },
    "quality": {
      "strictTypeChecking": true,
      "maxCyclomaticComplexity": 10,
      "minCohesion": 0.7
    }
  }
}
```

## 개발 로드맵

### ✅ Phase 1 (완료)
- FSD 아키텍처 스킬
- 기본 슬라이스 템플릿
- 슬래시 커맨드

### ✅ Phase 2 (완료)
- React Query 패턴 스킬
- FSD + React Query 통합

### ✅ Phase 3 (완료)
- 코드 퀄리티 스킬
- SOLID 원칙 검사
- 응집도/결합도 분석
- Code Smell Detection (Frontend Fundamentals 기반)

### 🚧 Phase 4 (진행 중)
- Zod Validation 스킬
- API/Form 스키마 생성

## 기여하기

이슈나 PR은 언제든 환영합니다!

## 라이선스

MIT License

## 참고 자료

- [Feature-Sliced Design 공식 문서](https://feature-sliced.design)
- [React Query 공식 문서](https://tanstack.com/query)
- [Frontend Fundamentals - 코드 품질](https://frontend-fundamentals.com/code-quality/code/)
- [Claude Code 플러그인 가이드](https://code.claude.com/docs/plugins)
