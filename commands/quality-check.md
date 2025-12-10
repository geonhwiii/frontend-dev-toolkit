---
description: Perform comprehensive code quality analysis based on 5 key principles (readability, predictability, cohesion, coupling, abstraction)
---

# Quality Check Command

코드 품질을 5대 원칙(가독성, 예측가능성, 응집도, 결합도, 추상화)으로 분석하고 개선 방안을 제시합니다.

## 이 커맨드가 하는 일

1. **품질 분석**: 5대 원칙 기반 코드 평가
2. **메트릭 측정**: 복잡도, 응집도, 결합도 점수 계산
3. **코드 스멜 탐지**: 안티패턴 및 개선 대상 식별
4. **SOLID 검증**: 원칙 준수 여부 확인
5. **리팩토링 제안**: 우선순위와 구체적인 개선 방안 제공

## 실행 단계

### 1. 사용자에게 확인

**질문 1: 분석 대상**
- "어떤 파일/디렉토리를 분석하시겠습니까?"
- 옵션:
  - 파일 경로 (예: src/components/UserProfile.tsx)
  - 디렉토리 경로 (예: src/features/auth)
  - 현재 열린 파일

**질문 2: 분석 깊이**
- "분석 레벨을 선택하세요"
- 옵션:
  - `quick` - 빠른 스캔 (기본 메트릭만)
  - `standard` - 표준 분석 (권장)
  - `deep` - 심층 분석 (모든 체크)

**질문 3: 보고서 형식**
- "보고서 형식을 선택하세요"
- 옵션:
  - `summary` - 요약만
  - `detailed` - 상세 보고서 (기본값)
  - `actionable` - 실행 가능한 제안 중심

### 2. 코드 스캔 및 분석

#### 2.1 파일 수집

```typescript
// 분석 대상 파일 수집
const files = collectFiles(targetPath, {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  exclude: ['node_modules', 'dist', 'build', '.test.', '.spec.'],
});
```

#### 2.2 메트릭 측정

```typescript
// 각 파일에 대해 측정
const metrics = {
  lines: countLines(file),
  cyclomaticComplexity: calculateComplexity(file),
  propsCount: countProps(file),
  stateCount: countStates(file),
  effectCount: countEffects(file),
  importCount: countImports(file),
  exportCount: countExports(file),
};
```

#### 2.3 원칙별 분석

**가독성 (Readability)**
```
✓ 검사 항목:
  - 함수 길이 (20라인 이하 권장)
  - 조건식 복잡도
  - 매직 넘버 사용
  - 변수명 명확성
```

**예측 가능성 (Predictability)**
```
✓ 검사 항목:
  - 네이밍 일관성
  - 반환 타입 일관성
  - 사이드 이펙트 명시성
```

**응집도 (Cohesion)**
```
✓ 검사 항목:
  - 관련 파일 위치
  - 상수 중앙화
  - 폴더 구조
```

**결합도 (Coupling)**
```
✓ 검사 항목:
  - 외부 의존성 비율
  - Props drilling 깊이
  - 순환 의존성
```

**추상화 (Abstraction)**
```
✓ 검사 항목:
  - 추상화 vs 추출
  - Props drilling 과도함
  - 컴포넌트 책임
```

### 3. SOLID 원칙 검증

#### SRP (Single Responsibility Principle)

```
✓ 검사:
  - 컴포넌트가 여러 책임을 가지는가?
  - useState/useEffect가 과도하게 많은가?
  - 비즈니스 로직과 UI 로직이 섞여있는가?
```

#### DIP (Dependency Inversion Principle)

```
✓ 검사:
  - 구체적인 구현에 직접 의존하는가?
  - 추상화 계층이 있는가?
  - fetch/axios 직접 사용 여부
```

### 4. 보고서 생성

#### Summary 형식

```
📊 Code Quality Summary
======================

Overall Score: 72/100 (Good)

Metrics:
- Lines: 180 ✅
- Cyclomatic Complexity: 8 ✅
- Props Count: 5 ✅
- State Count: 4 ✅
- Effect Count: 2 ✅

Issues: 3 found
- 1 High priority
- 2 Medium priority
```

#### Detailed 형식

```
📊 Code Quality Report
=====================

File: src/features/auth/ui/LoginForm.tsx
Total Lines: 180
Last Modified: 2024-01-15

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 5대 원칙 평가
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 가독성 (Readability): 75/100 ⚠️
   ✅ Strengths:
      - 변수명이 명확함
      - 함수 길이 적절
   
   ⚠️ Issues:
      - 라인 45: 복잡한 조건식
        const isValid = user.age > 18 && user.hasLicense && !user.isBanned;
        
        💡 Suggestion:
        const isAdult = user.age > 18;
        const hasLicense = user.hasLicense;
        const isNotBanned = !user.isBanned;
        const isValid = isAdult && hasLicense && isNotBanned;

      - 라인 67, 89: 매직 넘버
        setTimeout(() => {}, 5000);
        
        💡 Suggestion:
        const TIMEOUT_MS = 5000;
        setTimeout(() => {}, TIMEOUT_MS);

2. 예측 가능성 (Predictability): 85/100 ✅
   ✅ Strengths:
      - 일관된 네이밍
      - 명확한 함수명
   
   ✓ No major issues

3. 응집도 (Cohesion): 60/100 ⚠️
   ⚠️ Issues:
      - 관련 파일들이 흩어져 있음
        Current: validation.ts (lib/), LoginForm.tsx (ui/)
        
        💡 Suggestion:
        features/auth/
        ├── ui/
        │   └── LoginForm.tsx
        ├── lib/
        │   └── validation.ts (move here)
        └── model/
            └── schema.ts

4. 결합도 (Coupling): 70/100 ⚠️
   ⚠️ Issues:
      - SRP 위반 (라인 15-80)
        데이터 페칭 + 폼 관리 + UI 렌더링
        
        💡 Suggestion:
        // 1. Custom hook으로 분리
        function useLoginForm() {
          // 폼 로직
        }
        
        // 2. 컴포넌트는 UI만
        function LoginForm() {
          const { handleSubmit, isLoading } = useLoginForm();
          return <form onSubmit={handleSubmit}>...</form>;
        }

5. 추상화 (Abstraction): 80/100 ✅
   ✅ Strengths:
      - 적절한 추상화 레벨
      - 의미 있는 컴포넌트 분리

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 SOLID 원칙 검증
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ SRP (Single Responsibility): PASS
   각 함수가 단일 책임을 가짐

❌ DIP (Dependency Inversion): FAIL
   Issue: 라인 34에서 fetch 직접 사용
   
   💡 Suggestion:
   // Before
   const data = await fetch('/api/login', { ... });
   
   // After
   import { apiClient } from '@/shared/api';
   const data = await apiClient.post('login', { ... });

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 메트릭스
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Component Metrics:
- Lines of Code: 180 ✅ (limit: 250)
- Cyclomatic Complexity: 8 ✅ (limit: 10)
- Props Count: 5 ✅ (limit: 7)
- useState Count: 4 ✅ (limit: 5)
- useEffect Count: 2 ✅ (limit: 3)

Quality Scores:
- Cohesion Score: 60% ⚠️ (target: 70%+)
- Coupling Score: 0.15 ✅ (target: <0.3)
- TypeScript Coverage: 98% ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 Issues Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

High Priority (1):
  ❌ DIP 위반 - fetch 직접 사용 (line 34)

Medium Priority (2):
  ⚠️ 복잡한 조건식 (line 45)
  ⚠️ 응집도 낮음 - 파일 분산

Low Priority (2):
  💡 매직 넘버 (line 67, 89)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 개선 방안 (우선순위 순)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [High] DIP 위반 수정
   Time: ~15분
   
   Step 1: apiClient import 추가
   import { apiClient } from '@/shared/api';
   
   Step 2: fetch 호출 변경
   - const data = await apiClient.post('login', credentials);

2. [Medium] 응집도 개선
   Time: ~30분
   
   Step 1: validation.ts를 features/auth/lib/로 이동
   Step 2: schema.ts를 features/auth/model/로 이동

3. [Medium] 조건식 명확화
   Time: ~10분
   
   Step 1: 조건을 변수로 추출
   Step 2: 의미 있는 이름 부여

4. [Low] 매직 넘버 상수화
   Time: ~5분
   
   Step 1: constants.ts 생성
   Step 2: 매직 넘버를 상수로 정의

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Conclusion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Assessment: GOOD (72/100)

This code is maintainable but has room for improvement.
Focus on fixing the DIP violation first, then improve cohesion.

Estimated Refactoring Time: ~1 hour
Expected Score After Refactoring: 85-90/100
```

#### Actionable 형식

```
🔧 Actionable Improvements
=========================

✅ Quick Wins (< 10분):

1. Line 67, 89: 매직 넘버 상수화
   
   // constants.ts에 추가
   export const TIMEOUT_MS = 5000;
   
   // LoginForm.tsx에서 사용
   import { TIMEOUT_MS } from './constants';
   setTimeout(() => {}, TIMEOUT_MS);

2. Line 45: 조건식 명확화
   
   const isAdult = user.age > 18;
   const hasLicense = user.hasLicense;
   const isNotBanned = !user.isBanned;
   const isValid = isAdult && hasLicense && isNotBanned;

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Medium Impact (10-30분):

1. Line 34: DIP 위반 수정
   
   Impact: 테스트 용이성, 유지보수성 향상
   
   Before:
   const response = await fetch('/api/login', {
     method: 'POST',
     body: JSON.stringify(credentials)
   });
   
   After:
   import { apiClient } from '@/shared/api';
   const user = await apiClient.post('login', credentials);

2. 파일 구조 개선
   
   Impact: 응집도 향상, 관련 코드 찾기 쉬움
   
   Move:
   - lib/validation.ts → features/auth/lib/validation.ts
   - model/schema.ts → features/auth/model/schema.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ High Impact (30분+):

1. SRP 위반 해결
   
   Impact: 재사용성, 테스트 용이성 대폭 향상
   
   Before: 180 lines, 여러 책임
   After: 3개 파일로 분리
   
   // hooks/useLoginForm.ts
   export function useLoginForm() {
     // 폼 로직만
   }
   
   // ui/LoginForm.tsx
   export function LoginForm() {
     const form = useLoginForm();
     // UI 렌더링만
   }
```

### 5. 자동 수정 제안 (선택)

심각한 이슈에 대해 자동 수정을 제안:

```
🔧 Auto-fix Available
====================

1. 매직 넘버 상수화 (3곳)
   Apply fix? (y/n)

2. Import 정리
   Apply fix? (y/n)

3. 타입 any 제거 (2곳)
   Apply fix? (y/n)
```

## 예시

### 예시 1: 파일 분석

```
사용자: /quality-check

질문 1: 분석 대상?
답변: src/features/auth/ui/LoginForm.tsx

질문 2: 분석 레벨?
답변: standard

질문 3: 보고서 형식?
답변: detailed

→ 상세 보고서 생성
→ 개선 방안 제시
```

### 예시 2: 디렉토리 전체 분석

```
사용자: /quality-check

답변: src/features/auth, deep, summary

→ auth 기능 전체 분석
→ 요약 보고서 생성
```

## 분석 기준

### Thresholds

```typescript
const QUALITY_THRESHOLDS = {
  lines: { good: 200, warning: 250, critical: 300 },
  cyclomaticComplexity: { good: 7, warning: 10, critical: 15 },
  propsCount: { good: 5, warning: 7, critical: 10 },
  stateCount: { good: 3, warning: 5, critical: 7 },
  effectCount: { good: 2, warning: 3, critical: 5 },
  cohesionScore: { good: 80, warning: 60, critical: 40 },
  couplingScore: { good: 0.2, warning: 0.3, critical: 0.5 },
};
```

### Score Calculation

```typescript
// 전체 점수 = 가중 평균
const overallScore = 
  (readabilityScore * 0.2) +
  (predictabilityScore * 0.15) +
  (cohesionScore * 0.25) +
  (couplingScore * 0.25) +
  (abstractionScore * 0.15);

// 등급
// 90-100: Excellent
// 80-89: Good
// 70-79: Fair
// 60-69: Poor
// < 60: Critical
```

## 트러블슈팅

### 문제: "Cannot analyze file"

**해결책**:
1. 파일 경로 확인
2. TypeScript 설정 확인
3. 지원되는 확장자 확인 (.ts, .tsx, .js, .jsx)

### 문제: 분석이 느림

**해결책**:
1. `quick` 레벨 사용
2. 특정 파일만 분석
3. node_modules 제외 확인

## 후속 작업

품질 검사 후:

1. **High Priority 먼저**: 치명적인 이슈부터 수정
2. **리팩토링 실행**: 제안된 개선 사항 적용
3. **재검사**: /quality-check 다시 실행하여 개선 확인
4. **문서화**: 팀에 품질 기준 공유

