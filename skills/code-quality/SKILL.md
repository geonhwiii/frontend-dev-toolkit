---
name: code-quality
description: Helps improve code quality based on 5 key principles (readability, predictability, cohesion, coupling, abstraction) from Toss Frontend Fundamentals. Use when reviewing code, refactoring, checking SOLID principles, analyzing component complexity, identifying code smells, or when user mentions code quality, clean code, refactoring, SOLID, cohesion, coupling, abstraction, or code review.
---

# Code Quality Skill

변경하기 쉬운 프론트엔드 코드 작성을 위한 코드 품질 검사 및 개선 가이드입니다. Toss Frontend Fundamentals 기반의 5대 핵심 원칙을 적용합니다.

## Overview

**"좋은 코드를 작성하는 대신 나쁜 코드를 줄인다"**

완벽한 코드보다는 점진적으로 개선 가능한 코드를 지향합니다. 5가지 핵심 기준으로 코드를 평가하고 개선합니다.

## Capabilities

### 1. 코드 분석
- 가독성 점수 측정
- 응집도/결합도 분석
- 복잡도 계산 (Cyclomatic Complexity)
- Props Drilling 깊이 측정
- 추상화 레벨 일관성 검사

### 2. SOLID 원칙 검증
- SRP (Single Responsibility Principle) 위반 탐지
- DIP (Dependency Inversion Principle) 검사
- 컴포넌트 책임 분리 분석

### 3. 리팩토링 제안
- 코드 스멜 식별
- 구조 개선 제안
- 명명 규칙 개선
- 추상화 결정 가이드

### 4. 체크리스트 제공
- 코드 리뷰 체크리스트
- 레이어별 품질 기준
- 리팩토링 우선순위

## 5대 핵심 원칙

### 1. 가독성 (Readability)

코드가 읽기 쉬운 정도. 복잡한 로직을 이해할 수 있어야 변경할 수 있습니다.

#### ✅ 맥락 줄이기

```typescript
// ❌ Bad: 여러 책임이 섞여있음
function handleSubmit() {
  if (!isValid) return;
  setLoading(true);
  const data = formatData();
  fetch('/api/data', { method: 'POST', body: JSON.stringify(data) })
    .then(() => setLoading(false))
    .catch(() => setError(true));
}

// ✅ Good: 책임별로 분리
function handleSubmit() {
  if (!isFormValid()) return;
  submitData();
}

function submitData() {
  const data = formatData();
  setLoading(true);
  apiClient.submit(data)
    .then(handleSuccess)
    .catch(handleError);
}
```

#### ✅ 복잡한 조건에 이름 붙이기

```typescript
// ❌ Bad: 조건이 불명확
const eligible = user.age >= 18 && user.hasLicense && user.creditScore > 600 && !user.isBanned;

// ✅ Good: 의도 명확한 변수명
const isAdult = user.age >= 18;
const hasValidDocuments = user.hasLicense;
const hasGoodCreditScore = user.creditScore > 600;
const isNotBanned = !user.isBanned;
const isEligible = isAdult && hasValidDocuments && hasGoodCreditScore && isNotBanned;
```

#### ✅ 매직 넘버를 상수로

```typescript
// ❌ Bad: 숫자의 의미 불명확
setTimeout(() => checkStatus(), 5000);
const MAX_FILE_SIZE = 10485760;

// ✅ Good: 상수로 의미 명확화
const STATUS_CHECK_INTERVAL_MS = 5000;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

setTimeout(() => checkStatus(), STATUS_CHECK_INTERVAL_MS);
```

### 2. 예측 가능성 (Predictability)

동료들이 함수의 동작을 얼마나 쉽게 예측할 수 있는지.

#### ✅ 일관된 네이밍 규칙

```typescript
// ❌ Bad: 일관성 없는 네이밍
function getUserList() { }
function fetchUserData() { }
function loadUserInfo() { }

// ✅ Good: 일관된 네이밍
function getUserList() { }
function getUserData() { }
function getUserInfo() { }
```

#### ✅ 같은 종류의 함수는 반환 타입 통일

```typescript
// ❌ Bad: 불일치하는 반환 타입
function getApprovedUser(): User | null { }
function getPendingUser(): User | undefined { }
function getRejectedUser(): User { /* throws error */ }

// ✅ Good: 통일된 반환 타입
function getApprovedUser(): User | null { }
function getPendingUser(): User | null { }
function getRejectedUser(): User | null { }
```

#### ✅ 숨은 로직 드러내기

```typescript
// ❌ Bad: 숨겨진 사이드 이펙트
function calculateScore(user: User): number {
  const score = user.experience * 10 + user.education * 5;
  // 숨겨진 로직: 점수 로깅
  analytics.track('score_calculated', { score, userId: user.id });
  return score;
}

// ✅ Good: 명시적으로 분리
function calculateScore(user: User): number {
  return user.experience * 10 + user.education * 5;
}

function calculateAndTrackScore(user: User): number {
  const score = calculateScore(user);
  analytics.track('score_calculated', { score, userId: user.id });
  return score;
}
```

### 3. 응집도 (Cohesion)

함께 수정되어야 할 코드가 항상 같이 수정되는지.

#### ✅ 함께 수정되는 파일을 같은 디렉토리에 배치

```
// ✅ Good: 기능별 응집
features/user-profile/
├── model/
│   └── schema.ts
├── hooks/
│   └── use-user-form.ts
├── components/
│   └── UserForm.tsx
└── index.ts
```

#### ✅ 매직 넘버 제거로 일관성 보장

```typescript
// ❌ Bad: 여러 곳에 흩어진 매직 넘버
const isValidPassword = password.length >= 8;
const passwordInput = <Input maxLength={8} />;
const errorMessage = "비밀번호는 최소 8자 이상이어야 합니다.";

// ✅ Good: 중앙 관리
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  ERROR_MESSAGE: "비밀번호는 최소 8자 이상이어야 합니다."
} as const;

const isValidPassword = password.length >= PASSWORD_CONFIG.MIN_LENGTH;
const passwordInput = <Input maxLength={PASSWORD_CONFIG.MIN_LENGTH} />;
const errorMessage = PASSWORD_CONFIG.ERROR_MESSAGE;
```

### 4. 결합도 (Coupling)

코드를 수정했을 때의 영향범위. 범위를 최소화해야 변경하기 쉽습니다.

#### ✅ 단일 책임 원칙 (SRP)

```typescript
// ❌ Bad: 여러 책임을 가진 컴포넌트
function Dashboard() {
  const [user, setUser] = useState();
  useEffect(() => { fetchUser(); }, []);

  const [data, setData] = useState();
  useEffect(() => { fetchData(); }, []);

  const [selectedId, setSelectedId] = useState();

  return <div>...</div>;
}

// ✅ Good: 각 책임으로 분리
function Dashboard() {
  return (
    <div>
      <UserProfileSection />
      <DataListSection />
    </div>
  );
}

function UserProfileSection() {
  const { data: user } = useCurrentUser();
  return <UserProfile user={user} />;
}

function DataListSection() {
  const [selectedId, setSelectedId] = useState();
  const { data } = useDataList();
  return <DataList data={data} selectedId={selectedId} onSelect={setSelectedId} />;
}
```

#### ✅ Props Drilling 제거

```typescript
// ❌ Bad: 여러 단계의 props drilling
function App() {
  const [user, setUser] = useState();
  return <Dashboard user={user} setUser={setUser} />;
}

function Dashboard({ user, setUser }) {
  return <UserProfile user={user} setUser={setUser} />;
}

function UserProfile({ user, setUser }) {
  return <button onClick={() => setUser(null)}>로그아웃</button>;
}

// ✅ Good: Context 활용
const UserContext = createContext<{ user: User | null; setUser: (user: User | null) => void }>(null);

function App() {
  const [user, setUser] = useState();
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Dashboard />
    </UserContext.Provider>
  );
}

function UserProfile() {
  const { user, setUser } = useContext(UserContext);
  return <button onClick={() => setUser(null)}>로그아웃</button>;
}
```

### 5. 추상화 (Abstraction)

의미 있는 추상화는 복잡도를 낮추지만, 의미 없는 추상화는 오히려 복잡도를 높입니다.

#### ✅ 추상화 vs 추출 구분하기

```typescript
// ❌ Bad: 의미 없는 추상화 (단순 추출)
function List({ items, onDelete, onEdit, onView, sortOrder, filterType }) {
  return (
    <div>
      {items.map(item => (
        <Card
          key={item.id}
          item={item}
          onDelete={onDelete}
          onEdit={onEdit}
          onView={onView}
          sortOrder={sortOrder}
          filterType={filterType}
        />
      ))}
    </div>
  );
}

// ✅ Good: 의미 있는 추상화
function List({ items }: { items: Item[] }) {
  const { handleDelete, handleEdit } = useItemActions();
  const { sortOrder, filterType } = useListSettings();

  return (
    <div>
      {items.map(item => (
        <Card
          key={item.id}
          item={item}
          onDelete={() => handleDelete(item.id)}
          onEdit={() => handleEdit(item.id)}
        />
      ))}
    </div>
  );
}
```

## When This Skill Activates

This skill automatically activates when the user:

- Asks for code review or quality check
- Mentions refactoring or improving code
- Wants to check SOLID principles
- Asks about component complexity
- Mentions cohesion, coupling, or abstraction
- Wants guidance on code structure
- Asks "이 코드 어때?" or "리팩토링 해줘"
- Mentions clean code or best practices

## Usage Examples

### Example 1: 코드 리뷰 요청

**User**: "이 컴포넌트 코드 리뷰해줘"

**Response**:
```
📊 Code Quality Report
=====================

✅ Strengths:
- 일관된 네이밍 규칙
- 타입 안전성 확보

⚠️ Issues Found:

1. SRP 위반 (라인 15-45)
   현재: 데이터 페칭 + UI 렌더링 + 비즈니스 로직
   개선: Custom hook으로 비즈니스 로직 분리

2. Props Drilling (4단계)
   영향: 중간 컴포넌트들이 사용하지 않는 props 전달
   개선: Context API 또는 구조 재설계

3. 매직 넘버 (라인 23, 67, 89)
   개선: 상수로 정의하여 중앙 관리

📋 Refactoring Priority:
1. (High) SRP 위반 수정 - 비즈니스 로직 분리
2. (Medium) Props Drilling 해결
3. (Low) 매직 넘버 상수화
```

### Example 2: 리팩토링 제안

**User**: "이 코드를 개선하고 싶어"

**Response**:
단계별 리팩토링 제안:

1. **Step 1: 책임 분리**
   - 데이터 페칭 → useData hook
   - 비즈니스 로직 → useBusinessLogic hook
   - UI → Component

2. **Step 2: 응집도 향상**
   - 관련 파일들을 같은 디렉토리로 이동
   - 상수들을 config.ts로 중앙화

3. **Step 3: 결합도 감소**
   - Props drilling을 Context로 해결
   - 의존성 역전 적용

### Example 3: SOLID 원칙 검사

**User**: "SOLID 원칙을 잘 지키고 있는지 확인해줘"

**Response**:
```
🔍 SOLID Principles Check
========================

✅ SRP (Single Responsibility): PASS
   각 함수와 컴포넌트가 단일 책임을 가짐

❌ DIP (Dependency Inversion): FAIL
   Issue: 구체적인 구현에 직접 의존
   예시: 라인 34에서 fetch 직접 사용
   개선: apiClient 추상화 계층 사용

✅ 추상화 레벨: PASS
   일관된 추상화 레벨 유지
```

## Code Review Checklist

### 가독성
- [ ] 복잡한 조건식에 명시적인 이름이 붙어있는가?
- [ ] 매직 넘버가 상수로 정의되어 있는가?
- [ ] 함수의 길이가 적절한가? (20라인 이하 권장)

### 예측 가능성
- [ ] 함수명이 동작을 명확히 설명하는가?
- [ ] 같은 종류의 함수들이 일관된 반환 타입을 가지는가?
- [ ] 사이드 이펙트가 명시적으로 드러나는가?

### 응집도
- [ ] 관련된 파일들이 같은 디렉토리에 있는가?
- [ ] 함께 수정되어야 하는 코드가 가까이 있는가?
- [ ] 상수들이 중앙에서 관리되고 있는가?

### 결합도
- [ ] 컴포넌트가 단일 책임만 가지는가?
- [ ] Props drilling이 3단계를 넘지 않는가?
- [ ] 의존성이 명확히 정의되어 있는가?

### 추상화
- [ ] 추상화가 실제 복잡도를 감추는가? (단순 추출이 아닌가?)
- [ ] Props drilling이 과도하다면 구조를 결합형으로 재설계했는가?
- [ ] 관련된 상태와 로직이 같은 컴포넌트에 있는가?

## Quality Metrics

### Component Complexity

```typescript
// 복잡도 측정 기준
const COMPLEXITY_THRESHOLDS = {
  lines: 250,           // 컴포넌트 최대 라인 수
  useEffects: 3,        // useEffect 최대 개수
  useStates: 5,         // useState 최대 개수
  props: 7,             // props 최대 개수
  cyclomaticComplexity: 10, // 순환 복잡도
  propsDepth: 3,        // Props drilling 최대 깊이
};
```

### Cohesion Score

```typescript
// 응집도 점수 = 관련 파일들이 같은 디렉토리에 있는 비율
const cohesionScore = (filesInSameDir / totalRelatedFiles) * 100;

// 평가 기준:
// 90-100%: Excellent (높은 응집도)
// 70-89%: Good
// 50-69%: Fair (개선 필요)
// < 50%: Poor (구조 재설계 필요)
```

### Coupling Score

```typescript
// 결합도 점수 = 외부 의존성 / 총 코드 라인
const couplingScore = externalDependencies / totalLines;

// 평가 기준:
// < 0.1: Low coupling (좋음)
// 0.1-0.3: Medium coupling
// > 0.3: High coupling (나쁨)
```

## Refactoring Priorities

### 1. 안전성이 높은 경우: 가독성 우선
- 중복 코드 허용
- 명확한 네이밍 선택
- 매직 넘버 상수화

### 2. 오류 위험이 높은 경우: 응집도 우선
- 코드 공통화 및 추상화
- 중앙 집중식 관리
- 타입 안전성 강화

### 3. 변경 빈도가 높은 경우: 결합도 감소 우선
- 모듈 분리
- 인터페이스 추상화
- 의존성 역전

## Common Code Smells

### 1. God Component
```typescript
// ❌ Bad: 모든 것을 하는 컴포넌트
function UserDashboard() {
  // 100+ lines of state, effects, handlers
  // 많은 책임을 가짐
}

// ✅ Good: 책임 분리
function UserDashboard() {
  return (
    <>
      <UserProfile />
      <UserStats />
      <UserActivity />
    </>
  );
}
```

### 2. Feature Envy
```typescript
// ❌ Bad: 다른 객체의 데이터에 과도하게 접근
function calculateUserScore(user: User) {
  return user.profile.experience * 10 +
         user.profile.education * 5 +
         user.profile.skills.length * 2;
}

// ✅ Good: 데이터와 로직을 함께 배치
class UserProfile {
  calculateScore() {
    return this.experience * 10 +
           this.education * 5 +
           this.skills.length * 2;
  }
}
```

### 3. Long Parameter List
```typescript
// ❌ Bad: 긴 파라미터 리스트
function createUser(
  name: string,
  email: string,
  age: number,
  address: string,
  phone: string,
  role: string
) { }

// ✅ Good: 객체로 그룹화
interface CreateUserParams {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
  role: string;
}

function createUser(params: CreateUserParams) { }
```

## Additional Resources

- [Toss Frontend Fundamentals](https://toss.tech)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Refactoring by Martin Fowler](https://refactoring.com)

---

## Implementation Details

When activated, this skill will:

1. **Analyze**: 코드를 5대 원칙으로 분석
2. **Identify**: 코드 스멜과 안티패턴 식별
3. **Suggest**: 구체적인 개선 방안 제시
4. **Prioritize**: 리팩토링 우선순위 제공
5. **Guide**: 단계별 리팩토링 가이드 제공

The skill prioritizes practical, incremental improvements over perfect code.

