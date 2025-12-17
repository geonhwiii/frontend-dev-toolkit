---
description: Detect code smells based on Toss Frontend Fundamentals and provide specific refactoring suggestions
---

# Code Smell Command

Toss Frontend Fundamentals 기반으로 코드 스멜을 탐지하고 구체적인 리팩토링 방안을 제시합니다.

## 이 커맨드가 하는 일

1. **코드 스멜 탐지**: 4대 원칙(가독성, 예측가능성, 응집도, 결합도) 위반 식별
2. **문제 설명**: 왜 이것이 문제인지 명확하게 설명
3. **Before/After 예시**: 구체적인 개선 코드 제공
4. **우선순위 제안**: 심각도에 따른 개선 순서 제시

## 실행 단계

### 1. 사용자에게 확인

**질문 1: 분석 대상**
- "어떤 파일/코드를 분석하시겠습니까?"
- 옵션:
  - 파일 경로 (예: src/components/UserProfile.tsx)
  - 현재 열린 파일
  - 선택한 코드 블록

**질문 2: 분석 범위**
- "어떤 원칙을 중점적으로 검사하시겠습니까?"
- 옵션:
  - `all` - 모든 원칙 검사 (기본값)
  - `readability` - 가독성만
  - `predictability` - 예측 가능성만
  - `cohesion` - 응집도만
  - `coupling` - 결합도만

### 2. 코드 분석

#### 2.1 가독성 (Readability) 검사

```
✓ 검사 항목:
  - 같이 실행되지 않는 코드 혼재
  - 구현 상세 노출 (6-7개 이상 맥락)
  - 복잡한 조건식 (이름 없음)
  - 중첩된 삼항 연산자
  - 매직 넘버 사용
```

#### 2.2 예측 가능성 (Predictability) 검사

```
✓ 검사 항목:
  - 같은 이름, 다른 동작
  - 반환 타입 불일치
  - 숨은 사이드 이펙트
```

#### 2.3 응집도 (Cohesion) 검사

```
✓ 검사 항목:
  - 파일이 종류별로만 분류됨
  - 매직 넘버 분산
  - 폼 응집도 불일치
```

#### 2.4 결합도 (Coupling) 검사

```
✓ 검사 항목:
  - 한 Hook이 여러 책임 담당
  - 불필요한 공통화
  - Props Drilling (3단계 이상)
```

### 3. 보고서 생성

```
🔍 Code Smell Detection Report
==============================

File: src/features/auth/ui/LoginForm.tsx
Reference: https://frontend-fundamentals.com/code-quality/code/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 발견된 코드 스멜: 3개
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ [High] 같이 실행되지 않는 코드 혼재
   위치: 라인 15-45
   원칙: 가독성 (Readability)

   📌 문제점:
   Admin과 User 로직이 한 컴포넌트에 섞여있어
   두 가지 시나리오를 동시에 고려해야 함

   ❌ Before:
   function SubmitButton() {
     const isAdmin = useRole() === "admin";

     useEffect(() => {
       if (isAdmin) {
         loadAdminFeatures();
       }
     }, [isAdmin]);

     return isAdmin ? <AdminButton /> : <UserButton />;
   }

   ✅ After:
   function SubmitButton() {
     const isAdmin = useRole() === "admin";
     return isAdmin ? <AdminSubmitButton /> : <UserSubmitButton />;
   }

   function AdminSubmitButton() {
     useEffect(() => { loadAdminFeatures(); }, []);
     return <AdminButton />;
   }

   function UserSubmitButton() {
     return <UserButton />;
   }

   💡 개선 효과:
   - 각 컴포넌트가 하나의 시나리오만 처리
   - 코드 이해와 수정이 간단해짐

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ [Medium] 숨은 로직
   위치: 라인 67
   원칙: 예측 가능성 (Predictability)

   📌 문제점:
   fetchUserData 함수에 로깅이 숨겨져 있어
   함수명으로 동작을 예측할 수 없음

   ❌ Before:
   async function fetchUserData() {
     const data = await api.getUser();
     analytics.track('user_fetched');  // 숨겨진 사이드 이펙트
     return data;
   }

   ✅ After:
   async function fetchUserData() {
     return await api.getUser();
   }

   // 호출부에서 명시적으로 처리
   const data = await fetchUserData();
   analytics.track('user_fetched');

   💡 개선 효과:
   - 함수의 의도가 명확해짐
   - 재사용성 향상

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ [Low] 매직 넘버 사용
   위치: 라인 89, 103
   원칙: 가독성 (Readability)

   📌 문제점:
   숫자의 의미가 불명확하여 수정 시 연관성 파악 어려움

   ❌ Before:
   await delay(300);
   if (retryCount > 3) { ... }

   ✅ After:
   const ANIMATION_DELAY_MS = 300;
   const MAX_RETRY_COUNT = 3;

   await delay(ANIMATION_DELAY_MS);
   if (retryCount > MAX_RETRY_COUNT) { ... }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 개선 우선순위
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [High] 같이 실행되지 않는 코드 혼재
   예상 시간: ~20분
   영향: 가독성 대폭 향상

2. [Medium] 숨은 로직
   예상 시간: ~10분
   영향: 예측 가능성 향상

3. [Low] 매직 넘버 사용
   예상 시간: ~5분
   영향: 유지보수성 향상

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Issues: 3
- High: 1
- Medium: 1
- Low: 1

Estimated Fix Time: ~35분
```

## 탐지되는 코드 스멜 목록

### 가독성 (Readability)

| 코드 스멜 | 심각도 | 설명 |
|----------|--------|------|
| 코드 혼재 | High | 같이 실행되지 않는 코드가 섞여있음 |
| 구현 상세 노출 | Medium | 한 번에 처리할 맥락이 6-7개 초과 |
| 이름 없는 조건 | Medium | 복잡한 조건에 명시적 이름 없음 |
| 중첩 삼항 연산자 | Medium | 2단계 이상 중첩된 삼항 연산자 |
| 매직 넘버 | Low | 의미 불명확한 숫자 사용 |

### 예측 가능성 (Predictability)

| 코드 스멜 | 심각도 | 설명 |
|----------|--------|------|
| 이름 충돌 | High | 같은 이름이지만 다른 동작 |
| 반환 타입 불일치 | High | 같은 종류 함수의 반환 타입 다름 |
| 숨은 로직 | Medium | 함수명으로 예측 불가능한 사이드 이펙트 |

### 응집도 (Cohesion)

| 코드 스멜 | 심각도 | 설명 |
|----------|--------|------|
| 파일 분산 | Medium | 함께 수정되는 파일이 흩어져 있음 |
| 매직 넘버 분산 | Medium | 관련 있는 값들이 여러 곳에 분산 |
| 폼 응집도 불일치 | Low | 변경 단위와 코드 구조 불일치 |

### 결합도 (Coupling)

| 코드 스멜 | 심각도 | 설명 |
|----------|--------|------|
| 다중 책임 | High | 한 Hook/함수가 여러 책임 담당 |
| 불필요한 공통화 | Medium | 변경 가능성 높은 코드의 과도한 추상화 |
| Props Drilling | Medium | 3단계 이상의 props 전달 |

## 예시

### 예시 1: 파일 분석

```
사용자: /code-smell

질문 1: 분석 대상?
답변: src/features/auth/ui/LoginForm.tsx

질문 2: 분석 범위?
답변: all

→ 전체 원칙 기반 코드 스멜 탐지
→ Before/After 예시 제공
→ 우선순위 제안
```

### 예시 2: 특정 원칙만 검사

```
사용자: /code-smell

답변: src/components/, coupling

→ 결합도 관련 코드 스멜만 탐지
→ Props Drilling, 다중 책임 등 검사
```

### 예시 3: 선택한 코드 검사

```
사용자: (코드 선택 후) /code-smell

→ 선택한 코드 블록만 분석
→ 해당 코드의 문제점 식별
```

## 참고 자료

- [Frontend Fundamentals - 좋은 코드의 기준](https://frontend-fundamentals.com/code-quality/code/)
- [가독성 - 같이 실행되지 않는 코드 분리](https://frontend-fundamentals.com/code-quality/code/examples/submit-button.html)
- [예측 가능성 - 숨은 로직 드러내기](https://frontend-fundamentals.com/code-quality/code/examples/hidden-logic.html)
- [응집도 - 함께 수정되는 파일 배치](https://frontend-fundamentals.com/code-quality/code/examples/code-directory.html)
- [결합도 - Props Drilling 해결](https://frontend-fundamentals.com/code-quality/code/examples/item-edit-modal.html)

## 후속 작업

코드 스멜 탐지 후:

1. **High Priority 먼저**: 가장 심각한 문제부터 수정
2. **리팩토링 적용**: 제안된 After 코드 참고하여 수정
3. **재검사**: /code-smell 다시 실행하여 개선 확인
4. **품질 검사**: /quality-check로 전체 품질 점수 확인
