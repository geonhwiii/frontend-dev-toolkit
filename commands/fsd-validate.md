---
description: Validate FSD architecture structure and check for dependency rule violations
---

# FSD Validate Command

FSD 아키텍처 구조를 검증하고 의존성 규칙 위반을 체크합니다.

## 이 커맨드가 하는 일

1. **구조 검증**: FSD 레이어 구조가 올바른지 확인
2. **의존성 검사**: 레이어 간 의존성 규칙 준수 여부 확인
3. **Public API 검증**: index.ts를 통한 export 확인
4. **순환 의존성 탐지**: 순환 참조 찾기
5. **보고서 생성**: 위반 사항과 개선 제안 제공

## 실행 단계

### 1. 사용자에게 확인

**질문 1: 검증 범위**
- "어떤 범위를 검증하시겠습니까?"
- 옵션:
  - `all` - 전체 프로젝트 (기본값)
  - `layer` - 특정 레이어만
  - `slice` - 특정 슬라이스만
- 기본값: all

**질문 2: 검증 레벨** (범위가 layer인 경우)
- "어떤 레이어를 검증하시겠습니까?"
- 옵션: app, pages, widgets, features, entities, shared

**질문 3: 엄격 모드**
- "엄격 모드로 검증하시겠습니까?"
- Yes: 경고도 오류로 표시
- No: 오류만 표시 (기본값)

### 2. 프로젝트 구조 스캔

다음 디렉토리 구조를 확인:

```
src/
├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

각 레이어의 존재 여부와 슬라이스 구조를 스캔합니다.

### 3. 검증 항목

#### 3.1 레이어 구조 검증

```
✓ 검증 항목:
  - src/ 디렉토리 존재
  - FSD 레이어 디렉토리 존재 (app, pages, widgets, features, entities, shared)
  - 허용되지 않은 최상위 디렉토리 확인
```

#### 3.2 슬라이스 구조 검증

각 슬라이스에 대해:

```
✓ 검증 항목:
  - index.ts (Public API) 존재
  - 세그먼트 구조 (ui, api, model, lib, config)
  - 명명 규칙 (kebab-case)
```

#### 3.3 의존성 규칙 검증

dependency-rules.json을 기반으로:

```
✓ 검증 항목:
  - app → pages, widgets, features, entities, shared (하위 레이어만)
  - pages → widgets, features, entities, shared
  - widgets → features, entities, shared
  - features → entities, shared
  - entities → shared
  - shared → 없음 (다른 레이어 import 불가)
```

파일별로 import 문을 분석하여 위반 확인:

```typescript
// ❌ Bad: entities가 features를 import
// entities/user/api/user.api.ts
import { someUtil } from '@/features/auth'; // VIOLATION!

// ✅ Good: entities가 shared만 import
import { apiClient } from '@/shared/api';
```

#### 3.4 Public API 검증

```
✓ 검증 항목:
  - 모든 슬라이스에 index.ts 존재
  - 다른 레이어에서 index.ts를 통해서만 import하는지 확인
```

```typescript
// ❌ Bad: Public API 우회
import { User } from '@/entities/user/model/types';

// ✅ Good: Public API 사용
import { User } from '@/entities/user';
```

#### 3.5 순환 의존성 검증

```
✓ 검증 항목:
  - 슬라이스 간 순환 참조
  - 파일 간 순환 참조
```

### 4. 보고서 생성

검증 결과를 다음 형식으로 출력:

```
🔍 FSD Architecture Validation Report
=====================================

📊 Summary
----------
Total Slices: 15
Layers Checked: 6
Files Scanned: 127
Issues Found: 3

✅ Structure
-----------
✓ All FSD layers present
✓ Naming conventions followed
✓ Segment organization correct

⚠️ Dependencies (3 issues)
---------------------------
❌ ERROR: Layer dependency violation
   File: features/auth/api/auth.api.ts:5
   Issue: Features layer importing from widgets layer
   → import { Header } from '@/widgets/header';
   Fix: Move shared logic to entities or shared layer

❌ ERROR: Public API violation
   File: pages/HomePage.tsx:12
   Issue: Direct import bypassing Public API
   → import { User } from '@/entities/user/model/types';
   Fix: import { User } from '@/entities/user';

⚠️ WARNING: Cross-slice import
   File: features/edit-user/api/useUpdateUser.ts:8
   Issue: Importing from another feature in same layer
   → import { validateEmail } from '@/features/auth/lib/validation';
   Fix: Move shared validation to shared/lib

✅ Public API
-------------
✓ All slices have index.ts
✓ Proper barrel exports

✅ Circular Dependencies
------------------------
✓ No circular dependencies detected

📋 Recommendations
------------------
1. Fix layer dependency violations in features/auth
2. Use Public API imports in pages/HomePage
3. Consider moving shared validation to shared/lib

---
Overall Status: ⚠️ NEEDS ATTENTION (3 issues)
```

### 5. 자동 수정 제안 (선택)

심각한 위반이 발견된 경우 자동 수정을 제안:

```
🔧 Auto-fix available for 2 issues:

1. Public API violation in pages/HomePage.tsx
   Before: import { User } from '@/entities/user/model/types';
   After:  import { User } from '@/entities/user';
   
   Apply fix? (y/n)

2. Cross-slice import in features/edit-user
   Detected: Shared utility being imported from another feature
   Suggestion: Move to shared/lib/validation.ts
   
   Create shared utility? (y/n)
```

## 예시

### 예시 1: 전체 검증

```
사용자: /fsd-validate

질문: 검증 범위?
답변: all

질문: 엄격 모드?
답변: n

→ 전체 프로젝트 스캔
→ 보고서 생성
```

### 예시 2: 특정 레이어 검증

```
사용자: /fsd-validate

질문: 검증 범위?
답변: layer

질문: 레이어 선택?
답변: features

→ features 레이어만 검증
→ features의 의존성 규칙 확인
```

### 예시 3: 엄격 모드

```
사용자: /fsd-validate

답변: all, y

→ 경고도 오류로 처리
→ 더 엄격한 기준으로 검증
```

## 검증 규칙

### 레이어 의존성 규칙

```typescript
const LAYER_DEPENDENCIES = {
  app: ['pages', 'widgets', 'features', 'entities', 'shared'],
  pages: ['widgets', 'features', 'entities', 'shared'],
  widgets: ['features', 'entities', 'shared'],
  features: ['entities', 'shared'],
  entities: ['shared'],
  shared: [],
};
```

### 명명 규칙

```
✓ Layers: lowercase (entities, features)
✓ Slices: kebab-case (user-profile, add-to-cart)
✓ Segments: lowercase (ui, api, model, lib, config)
✓ Files:
  - Components: PascalCase (UserCard.tsx)
  - Utilities: camelCase (formatDate.ts)
  - Types: camelCase (types.ts)
```

### Public API 패턴

```typescript
// ✅ Good: Each slice exports through index.ts
// entities/user/index.ts
export type { User } from './model';
export { userQueries, userKeys } from './api';
export { UserCard } from './ui';

// Other files import from index
import { User, userQueries } from '@/entities/user';
```

## 트러블슈팅

### 문제: "Cannot analyze imports"

**해결책**: 
1. TypeScript 설정 확인
2. path alias 설정 확인
3. node_modules 제외 확인

### 문제: 오탐지 (False Positive)

**해결책**:
1. .fsdrc.json에 예외 규칙 추가
2. 특정 파일 검증 제외 설정

```json
{
  "ignorePatterns": [
    "**/*.test.ts",
    "**/*.spec.ts"
  ],
  "allowExceptions": {
    "features/legacy": {
      "canImport": ["widgets"]
    }
  }
}
```

### 문제: 검증이 느림

**해결책**:
1. 특정 레이어만 검증
2. node_modules, dist 디렉토리 제외 확인
3. 캐시 사용

## 지속적인 검증

### Git Hook으로 자동 검증

```bash
# .husky/pre-commit
#!/bin/sh
npm run fsd:validate

# package.json
{
  "scripts": {
    "fsd:validate": "claude-code /fsd-validate"
  }
}
```

### CI/CD 통합

```yaml
# .github/workflows/fsd-validate.yml
name: FSD Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run fsd:validate
```

## 후속 작업

검증 후:

1. **위반 사항 수정**: 보고서의 Fix 제안 따르기
2. **구조 개선**: 반복되는 패턴 확인
3. **문서화**: 팀에 FSD 규칙 공유
4. **정기 검증**: 주기적으로 /fsd-validate 실행

