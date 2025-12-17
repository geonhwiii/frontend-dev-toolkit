---
name: code-smell
description: Detects and fixes code smells based on Toss Frontend Fundamentals. Use when analyzing code for readability issues, predictability problems, cohesion gaps, coupling concerns, or when user mentions code smell, bad code, refactor this, improve code, or asks "what's wrong with this code".
---

# Code Smell Detection Skill

Toss Frontend Fundamentals 기반의 코드 스멜 탐지 및 개선 가이드입니다. 4가지 핵심 기준(가독성, 예측 가능성, 응집도, 결합도)을 바탕으로 코드의 문제점을 식별하고 구체적인 개선 방안을 제시합니다.

> **Reference**: https://frontend-fundamentals.com/code-quality/code/

## Overview

**"좋은 코드를 작성하는 대신 나쁜 코드를 줄인다"**

이 스킬은 코드에서 "냄새나는" 부분을 탐지하고, 왜 문제인지 설명하며, 구체적인 Before/After 예시와 함께 개선 방안을 제시합니다.

## Capabilities

### 1. 코드 스멜 탐지
- 가독성 저해 요소 식별
- 예측 불가능한 패턴 탐지
- 응집도 문제 분석
- 결합도 이슈 발견

### 2. 구체적 개선 제안
- Before/After 코드 예시
- 단계별 리팩토링 가이드
- 우선순위 기반 개선 계획

### 3. 원칙 기반 설명
- 왜 이것이 문제인지 명확한 설명
- 어떤 원칙을 위반하는지 제시
- 개선 후 얻는 이점 설명

---

## 1. 가독성 (Readability) 코드 스멜

코드가 읽기 쉬운 정도. 복잡한 로직을 이해할 수 있어야 변경할 수 있습니다.

### 1.1 같이 실행되지 않는 코드가 섞여있음

**문제**: 상태에 따라 다른 코드가 한 컴포넌트에 섞여있어 맥락 파악이 어려움

```typescript
// ❌ Bad: viewer와 admin 로직이 섞여있음
function SubmitButton() {
  const isViewer = useRole() === "viewer";

  useEffect(() => {
    if (isViewer) {
      return;
    }
    showButtonAnimation();
  }, [isViewer]);

  return isViewer ? (
    <TextButton disabled>Submit</TextButton>
  ) : (
    <Button type="submit">Submit</Button>
  );
}

// ✅ Good: 역할별로 분리
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}

function ViewerSubmitButton() {
  return <TextButton disabled>Submit</TextButton>;
}

function AdminSubmitButton() {
  useEffect(() => {
    showButtonAnimation();
  }, []);
  return <Button type="submit">Submit</Button>;
}
```

**개선 효과**: 각 컴포넌트가 하나의 시나리오만 처리하여 코드 이해와 수정이 간단해짐

### 1.2 구현 상세가 노출되어 있음

**문제**: 한 번에 처리할 맥락이 너무 많아 인지 부하 증가 (6-7개 초과)

```typescript
// ❌ Bad: 로그인 확인 → 리다이렉트 로직이 노출됨
function LoginStartPage() {
  useCheckLogin({
    onChecked: (status) => {
      if (status === "LOGGED_IN") {
        location.href = "/home";
      }
    }
  });
  return <>{/* 로그인 컴포넌트 */}</>;
}

// ✅ Good: Wrapper 컴포넌트로 추상화
function App() {
  return (
    <AuthGuard>
      <LoginStartPage />
    </AuthGuard>
  );
}

function AuthGuard({ children }) {
  const status = useCheckLoginStatus();

  useEffect(() => {
    if (status === "LOGGED_IN") {
      location.href = "/home";
    }
  }, [status]);

  return status !== "LOGGED_IN" ? children : null;
}

function LoginStartPage() {
  return <>{/* 로그인 컴포넌트 */}</>;
}
```

**개선 효과**: LoginStartPage는 로그인 UI에만 집중 가능

### 1.3 복잡한 조건에 이름이 없음

**문제**: 중첩된 조건의 의도를 파악하기 어려움

```typescript
// ❌ Bad: 조건이 복잡하게 얽혀있음
const result = products.filter((product) =>
  product.categories.some(
    (category) =>
      category.id === targetCategory.id &&
      product.prices.some((price) => price >= minPrice && price <= maxPrice)
  )
);

// ✅ Good: 각 조건에 명시적 이름 부여
const matchedProducts = products.filter((product) => {
  return product.categories.some((category) => {
    const isSameCategory = category.id === targetCategory.id;
    const isPriceInRange = product.prices.some(
      (price) => price >= minPrice && price <= maxPrice
    );
    return isSameCategory && isPriceInRange;
  });
});
```

### 1.4 복잡한 삼항 연산자

**문제**: 다중 중첩된 삼항 연산자로 조건 흐름 파악 어려움

```typescript
// ❌ Bad: 중첩된 삼항 연산자
const status =
  A조건 && B조건 ? "BOTH" : A조건 || B조건 ? (A조건 ? "A" : "B") : "NONE";

// ✅ Good: IIFE + if-return 패턴
const status = (() => {
  if (A조건 && B조건) return "BOTH";
  if (A조건) return "A";
  if (B조건) return "B";
  return "NONE";
})();
```

### 1.5 매직 넘버 사용

**문제**: 숫자의 의미가 불명확하여 수정 시 연관성 파악 어려움

```typescript
// ❌ Bad: 300의 의미가 불명확
async function onLikeClick() {
  await postLike(url);
  await delay(300);
  await refetchPostLike();
}

// ✅ Good: 상수명으로 의도 명확화
const ANIMATION_DELAY_MS = 300;

async function onLikeClick() {
  await postLike(url);
  await delay(ANIMATION_DELAY_MS);
  await refetchPostLike();
}
```

---

## 2. 예측 가능성 (Predictability) 코드 스멜

협업자들이 함수/컴포넌트의 동작을 예측할 수 있는 정도.

### 2.1 같은 이름이지만 다른 동작

**문제**: 외부 라이브러리와 내부 함수가 같은 이름을 사용하여 기대 동작과 실제 동작 불일치

```typescript
// ❌ Bad: 라이브러리의 http와 이름이 겹침
// http.ts
import { http as httpLibrary } from "@some-library/http";

export const http = {
  async get(url: string) {
    const token = await fetchToken();
    return httpLibrary.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// fetchUser.ts - http.get()이 단순 GET인지 인증 포함인지 불명확
import { http } from "./http";
export async function fetchUser() {
  return http.get("...");
}

// ✅ Good: 명확하게 구분
// httpService.ts
import { http as httpLibrary } from "@some-library/http";

export const httpService = {
  async getWithAuth(url: string) {
    const token = await fetchToken();
    return httpLibrary.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

// fetchUser.ts
import { httpService } from "./httpService";
export async function fetchUser() {
  return await httpService.getWithAuth("...");
}
```

### 2.2 같은 종류의 함수가 다른 반환 타입

**문제**: 일관성 없는 반환 타입으로 팀원들의 혼란 유발

```typescript
// ❌ Bad: Hook마다 반환 타입이 다름
function useUser() {
  const query = useQuery({ queryKey: ["user"], queryFn: fetchUser });
  return query;  // Query 객체 반환
}

function useServerTime() {
  const query = useQuery({ queryKey: ["serverTime"], queryFn: fetchServerTime });
  return query.data;  // 데이터만 반환
}

// ✅ Good: 반환 타입 통일
function useUser() {
  const query = useQuery({ queryKey: ["user"], queryFn: fetchUser });
  return query;
}

function useServerTime() {
  const query = useQuery({ queryKey: ["serverTime"], queryFn: fetchServerTime });
  return query;  // Query 객체로 통일
}
```

```typescript
// ❌ Bad: 검증 함수의 반환 타입 불일치
function checkIsNameValid(name: string) {
  return name.length > 0 && name.length < 20;  // boolean
}

function checkIsAgeValid(age: number) {
  if (!Number.isInteger(age)) {
    return { ok: false, reason: "나이는 정수여야 해요." };  // 객체
  }
  // ...
  return { ok: true };
}

// 사용 시 문제
if (checkIsAgeValid(age)) { }  // 항상 true! (객체는 truthy)

// ✅ Good: Discriminated Union으로 통일
type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

function checkIsNameValid(name: string): ValidationResult {
  if (name.length === 0) {
    return { ok: false, reason: "이름은 빈 값일 수 없어요." };
  }
  if (name.length >= 20) {
    return { ok: false, reason: "이름은 20자 이상 입력할 수 없어요." };
  }
  return { ok: true };
}

function checkIsAgeValid(age: number): ValidationResult {
  if (!Number.isInteger(age)) {
    return { ok: false, reason: "나이는 정수여야 해요." };
  }
  // ...
  return { ok: true };
}
```

### 2.3 숨은 로직이 있음

**문제**: 함수명과 반환타입만으로는 알 수 없는 부수효과 존재

```typescript
// ❌ Bad: 로깅이 숨겨져 있음
async function fetchBalance(): Promise<number> {
  const balance = await http.get<number>("...");
  logging.log("balance_fetched");  // 숨겨진 사이드 이펙트
  return balance;
}

// ✅ Good: 순수 함수로 분리
async function fetchBalance(): Promise<number> {
  const balance = await http.get<number>("...");
  return balance;
}

// 사용처에서 명시적으로 처리
<Button onClick={async () => {
  const balance = await fetchBalance();
  logging.log("balance_fetched");
  await syncBalance(balance);
}}>
  계좌 잔액 갱신하기
</Button>
```

---

## 3. 응집도 (Cohesion) 코드 스멜

함께 수정되어야 할 코드가 항상 같이 수정되는지.

### 3.1 파일이 종류별로만 분류됨

**문제**: 파일 간 의존 관계 파악 어려움, 기능 삭제 시 연관 파일 찾기 곤란

```
// ❌ Bad: 파일 종류별 분류
└─ src
   ├─ components
   ├─ constants
   ├─ containers
   ├─ contexts
   ├─ remotes
   ├─ hooks
   └─ utils

// ✅ Good: 도메인 기반 구조
└─ src
   ├─ components (전체 프로젝트 공용)
   ├─ hooks
   ├─ utils
   └─ domains
      ├─ User
      │  ├─ components
      │  ├─ hooks
      │  └─ utils
      └─ Order
         ├─ components
         ├─ hooks
         └─ utils
```

**개선 효과**:
- 부적절한 참조 즉시 인식 가능
- 관련 코드를 함께 삭제 가능
- 프로젝트 성장 시에도 구조 유지

### 3.2 매직 넘버가 여러 곳에 흩어짐

**문제**: 한쪽만 수정될 경우 서비스가 조용히 깨질 위험

```typescript
// ❌ Bad: 관련 있는 값들이 분산됨
// file1.ts
const isValidPassword = password.length >= 8;

// file2.tsx
const passwordInput = <Input maxLength={8} />;

// file3.ts
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

### 3.3 폼의 응집도 불일치

**문제**: 변경 단위와 코드 구조가 맞지 않음

```typescript
// 필드 단위 응집도 (재사용성 높음)
register("email", {
  validate: (value) => {
    if (isEmptyStringOrNil(value)) return "이메일을 입력해주세요.";
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
      return "유효한 이메일 주소를 입력해주세요.";
    return "";
  }
})

// 폼 전체 단위 응집도 (일관성 높음)
const schema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("유효한 이메일 주소를 입력해주세요.")
});
```

**선택 기준**:
- 필드가 여러 폼에서 재사용됨 → 필드 단위
- 폼이 완결된 기능 (결제, 배송) → 폼 전체 단위
- 필드 간 의존성 (비밀번호 확인) → 폼 전체 단위

---

## 4. 결합도 (Coupling) 코드 스멜

코드를 수정했을 때의 영향범위 크기.

### 4.1 한 Hook이 여러 책임을 담당

**문제**: 수정 영향이 광범위해져 유지보수 어려움

```typescript
// ❌ Bad: 5가지 쿼리 파라미터를 한 Hook에서 관리
export function usePageState() {
  // cardId, statementId, dateFrom, dateTo, statusList
  return {
    values: { cardId, statementId, dateFrom, dateTo, statusList },
    controls: { setCardId, setStatementId, setDateFrom, setDateTo, setStatusList }
  }
}

// ✅ Good: 책임별로 분리
export function useCardIdQueryParam() {
  const [cardId, _setCardId] = useQueryParam("cardId", NumberParam);
  const setCardId = useCallback((cardId: number) => {
    _setCardId({ cardId }, "replaceIn");
  }, []);
  return [cardId ?? undefined, setCardId] as const;
}

// 각 파라미터별 독립적인 Hook 작성
export function useStatementIdQueryParam() { /* ... */ }
export function useDateRangeQueryParam() { /* ... */ }
```

### 4.2 불필요한 공통화

**문제**: 페이지마다 요구사항이 달라질 여지가 있는데 공통화됨

```typescript
// ❌ Bad: 공통화되어 변경이 어려움
export const useOpenMaintenanceBottomSheet = () => {
  const maintenanceBottomSheet = useMaintenanceBottomSheet();
  const logger = useLogger();

  return async (maintainingInfo: TelecomMaintenanceInfo) => {
    logger.log("점검 바텀시트 열림");
    const result = await maintenanceBottomSheet.open(maintainingInfo);
    if (result) {
      logger.log("점검 바텀시트 알림받기 클릭");
    }
    closeView();
  };
};

// 문제 상황:
// - 페이지마다 로깅 값이 다르면?
// - 특정 페이지에서만 화면을 닫지 않아야 하면?
// - 바텀시트의 텍스트/이미지를 다르게 표시해야 하면?
```

**권장**: 동작이 동일하고 미래 변경 가능성이 낮을 때만 공통화. 그렇지 않으면 중복 허용.

### 4.3 Props Drilling

**문제**: 중간 컴포넌트들이 사용하지 않는 props를 전달

```typescript
// ❌ Bad: Props Drilling
function ItemEditModal({ open, items, recommendedItems, onConfirm, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <ItemEditBody
        items={items}
        recommendedItems={recommendedItems}  // Drilling
        onConfirm={onConfirm}  // Drilling
        onClose={onClose}
      />
    </Modal>
  );
}

// ✅ Good: Composition 패턴
function ItemEditModal({ open, items, recommendedItems, onConfirm, onClose }) {
  const [keyword, setKeyword] = useState("");
  return (
    <Modal open={open} onClose={onClose}>
      <ItemEditBody keyword={keyword} onKeywordChange={setKeyword} onClose={onClose}>
        <ItemEditList
          keyword={keyword}
          items={items}
          recommendedItems={recommendedItems}
          onConfirm={onConfirm}
        />
      </ItemEditBody>
    </Modal>
  );
}

function ItemEditBody({ children, keyword, onKeywordChange, onClose }) {
  return (
    <>
      <div>
        <Input value={keyword} onChange={(e) => onKeywordChange(e.target.value)} />
        <Button onClick={onClose}>닫기</Button>
      </div>
      {children}
    </>
  );
}
```

**대안 B: Context API**
```typescript
function ItemEditList({ keyword, onConfirm }) {
  const { items, recommendedItems } = useItemEditModalContext();
  // Context에서 직접 데이터 소비
  return ( /* ... */ );
}
```

---

## When This Skill Activates

This skill automatically activates when the user:

- Asks "이 코드 뭐가 문제야?" or "what's wrong with this code"
- Mentions "code smell", "나쁜 코드", "bad code"
- Wants to refactor or improve code quality
- Asks for code review
- Mentions readability, predictability, cohesion, coupling
- Shows complex nested conditions or props drilling
- Has multiple similar functions with different return types

## Usage Examples

### Example 1: 코드 스멜 탐지

**User**: "이 코드 뭐가 문제야?"
```typescript
function UserDashboard() {
  const isAdmin = useRole() === "admin";

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      loadUserData();
    }
  }, [isAdmin]);

  return isAdmin ? (
    <AdminPanel onSave={saveAdminData} />
  ) : (
    <UserPanel onSave={saveUserData} />
  );
}
```

**Response**:
```
🔍 Code Smell Detection Report
==============================

⚠️ 발견된 문제: 같이 실행되지 않는 코드가 섞여있음

📌 문제점:
- Admin과 User 로직이 한 컴포넌트에 혼재
- useEffect 내부에서 분기 처리
- 두 가지 시나리오를 동시에 고려해야 함

📋 영향받는 원칙: 가독성 (Readability)

✅ 개선 방안:

function UserDashboard() {
  const isAdmin = useRole() === "admin";
  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}

function AdminDashboard() {
  useEffect(() => { loadAdminData(); }, []);
  return <AdminPanel onSave={saveAdminData} />;
}

function UserDashboard() {
  useEffect(() => { loadUserData(); }, []);
  return <UserPanel onSave={saveUserData} />;
}

💡 개선 효과:
- 각 컴포넌트가 하나의 시나리오만 처리
- 코드 이해와 수정이 간단해짐
- 테스트 용이성 향상
```

### Example 2: Props Drilling 탐지

**User**: "이 컴포넌트 리팩토링 해줘"
```typescript
function App({ user, theme, settings, notifications }) {
  return <Dashboard user={user} theme={theme} settings={settings} notifications={notifications} />;
}

function Dashboard({ user, theme, settings, notifications }) {
  return <Sidebar user={user} theme={theme} settings={settings} notifications={notifications} />;
}

function Sidebar({ user, theme, settings, notifications }) {
  return <UserProfile user={user} notifications={notifications} />;
}
```

**Response**:
```
🔍 Code Smell Detection Report
==============================

⚠️ 발견된 문제: Props Drilling (3단계)

📌 문제점:
- Dashboard, Sidebar가 실제로 사용하지 않는 props를 전달
- props 이름 변경 시 모든 중간 컴포넌트 수정 필요
- 영향 범위가 불필요하게 확대됨

📋 영향받는 원칙: 결합도 (Coupling)

✅ 개선 방안 A: Composition 패턴
function App({ user, theme, settings, notifications }) {
  return (
    <Dashboard>
      <Sidebar>
        <UserProfile user={user} notifications={notifications} />
      </Sidebar>
    </Dashboard>
  );
}

✅ 개선 방안 B: Context API
const AppContext = createContext();

function App({ user, theme, settings, notifications }) {
  return (
    <AppContext.Provider value={{ user, theme, settings, notifications }}>
      <Dashboard />
    </AppContext.Provider>
  );
}

function UserProfile() {
  const { user, notifications } = useContext(AppContext);
  // ...
}
```

## Code Smell Checklist

### 가독성
- [ ] 같이 실행되지 않는 코드가 한 컴포넌트에 섞여있지 않은가?
- [ ] 한 번에 처리할 맥락이 6-7개를 넘지 않는가?
- [ ] 복잡한 조건에 명시적인 이름이 붙어있는가?
- [ ] 삼항 연산자가 2단계 이상 중첩되지 않았는가?
- [ ] 매직 넘버가 상수로 정의되어 있는가?

### 예측 가능성
- [ ] 같은 이름의 함수/변수가 같은 동작을 하는가?
- [ ] 같은 종류의 함수들이 일관된 반환 타입을 가지는가?
- [ ] 함수명으로 예측되지 않는 숨은 로직이 없는가?

### 응집도
- [ ] 함께 수정되어야 할 파일들이 같은 디렉토리에 있는가?
- [ ] 관련 있는 매직 넘버들이 중앙에서 관리되는가?
- [ ] 폼의 응집도가 변경 단위와 일치하는가?

### 결합도
- [ ] 한 Hook/함수가 하나의 책임만 가지는가?
- [ ] 미래 변경 가능성이 높은 코드가 불필요하게 공통화되지 않았는가?
- [ ] Props drilling이 3단계를 넘지 않는가?

## Detection Priority

### High Priority (즉시 수정 권장)
1. 같이 실행되지 않는 코드 혼재
2. 숨은 로직 (side effect)
3. 일관성 없는 반환 타입

### Medium Priority (시간 날 때 수정)
1. Props Drilling 3단계 이상
2. 매직 넘버 분산
3. 불필요한 공통화

### Low Priority (리팩토링 시 고려)
1. 복잡한 삼항 연산자
2. 파일 구조 개선
3. 이름 충돌

---

## Implementation Details

When activated, this skill will:

1. **Detect**: 코드에서 4가지 원칙 위반 탐지
2. **Explain**: 왜 문제인지 명확하게 설명
3. **Suggest**: Before/After 예시와 함께 개선 방안 제시
4. **Prioritize**: 문제의 심각도에 따른 우선순위 제공

The skill focuses on identifying specific, actionable code smells rather than abstract principles.
