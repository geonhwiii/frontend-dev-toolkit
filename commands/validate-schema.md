---
description: Validate and analyze Zod schemas for completeness, type safety, and best practices
---

# Validate Schema Command

Zod 스키마를 분석하고 검증하여 개선 방안을 제시합니다.

## 이 커맨드가 하는 일

1. **스키마 분석**: Zod 스키마 구조 및 패턴 분석
2. **타입 안전성 검증**: 타입 추론 및 안전성 확인
3. **에러 메시지 검사**: 사용자 친화적인 에러 메시지 여부 확인
4. **베스트 프랙티스 검증**: Zod 권장 패턴 준수 여부
5. **개선 제안**: 더 나은 스키마 작성 방법 제시

## 실행 단계

### 1. 사용자에게 확인

**질문 1: 검증 대상**
- "어떤 스키마 파일을 검증하시겠습니까?"
- 옵션:
  - 파일 경로 (예: src/entities/user/model/schema.ts)
  - 디렉토리 경로 (모든 schema.ts 파일)
  - 현재 열린 파일

**질문 2: 검증 레벨**
- "검증 레벨을 선택하세요"
- 옵션:
  - `basic` - 기본 구조만 검증
  - `standard` - 표준 검증 (기본값)
  - `strict` - 엄격한 검증 (모든 best practice 체크)

### 2. 스키마 스캔 및 분석

#### 2.1 스키마 파일 수집

```typescript
// schema.ts 파일 찾기
const schemaFiles = glob('**/*schema.ts', {
  cwd: targetPath,
  ignore: ['node_modules', 'dist'],
});
```

#### 2.2 스키마 구조 분석

```
✓ 검사 항목:
  - Zod import 확인
  - 스키마 정의 여부
  - 타입 export 여부
  - 변환(transform) 사용
  - 검증 규칙(refine) 사용
```

### 3. 검증 항목

#### 3.1 타입 안전성

```
✓ 검사:
  - z.infer로 타입 추론
  - 타입과 스키마 불일치
  - any 사용 여부
  - optional vs nullable 구분
```

#### 3.2 에러 메시지

```
✓ 검사:
  - 모든 검증에 커스텀 메시지
  - 메시지가 명확하고 실행 가능한가
  - 다국어 지원 가능성
```

#### 3.3 스키마 구성

```
✓ 검사:
  - DTO 스키마 분리
  - Transform 사용
  - 재사용 가능성
  - 스키마 합성(compose)
```

#### 3.4 검증 규칙

```
✓ 검사:
  - 적절한 검증 사용
  - 성능 고려 (비동기 검증)
  - Edge case 처리
```

### 4. 보고서 생성

```
🔍 Schema Validation Report
==========================

File: entities/user/model/schema.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Schemas Found: 3
- userDtoSchema
- userSchema
- createUserSchema

Type Exports: 2
- User
- CreateUserData

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Type Safety: PASS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ All schemas have type inference
✓ No 'any' types detected
✓ Optional/Nullable properly used

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Error Messages: WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issues Found:

1. Line 15: Missing custom error message
   
   Current:
   email: z.string().email(),
   
   💡 Suggestion:
   email: z.string()
     .min(1, 'Email is required')
     .email('Please enter a valid email address'),

2. Line 23: Generic error message
   
   Current:
   age: z.number().min(18, 'Invalid'),
   
   💡 Suggestion:
   age: z.number()
     .int('Age must be a whole number')
     .min(18, 'You must be at least 18 years old'),

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Schema Composition: PASS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ DTO schema properly separated
✓ Transform used for conversion
✓ Good reusability

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Recommendations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Add custom error messages (2 locations)
   Priority: Medium
   Impact: Better UX

2. Consider extracting reusable validators
   
   Example:
   // validators.ts
   export const emailValidator = z.string()
     .min(1, 'Email is required')
     .email('Please enter a valid email address');
   
   // schema.ts
   email: emailValidator,

3. Add JSDoc comments to schemas
   
   Example:
   /**
    * User domain schema
    * Transforms API DTO to domain model
    */
   export const userSchema = ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Quality Score: 85/100 (Good)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Breakdown:
- Type Safety: 100/100 ✅
- Error Messages: 70/100 ⚠️
- Schema Composition: 90/100 ✅
- Validation Rules: 85/100 ✅

Overall: Good quality schemas with minor improvements needed.
```

### 5. 구체적인 개선 제안

```
🔧 Actionable Improvements
=========================

✅ Quick Wins (< 5분):

1. Line 15: Add error messages to email field
   
   email: z.string()
     .min(1, 'Email is required')
     .email('Please enter a valid email address'),

2. Line 23: Improve age validation message
   
   age: z.number()
     .int('Age must be a whole number')
     .min(18, 'You must be at least 18 years old')
     .max(120, 'Please enter a valid age'),

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Medium Impact (10-20분):

1. Extract common validators
   
   Create: shared/lib/validators.ts
   
   export const emailValidator = z.string()
     .min(1, 'Email is required')
     .email('Please enter a valid email address');
   
   export const passwordValidator = z.string()
     .min(8, 'Password must be at least 8 characters')
     .regex(/[A-Z]/, 'Must contain uppercase letter')
     .regex(/[0-9]/, 'Must contain number');

2. Add schema documentation
   
   /**
    * User DTO from API response
    * Fields use snake_case as per API convention
    */
   export const userDtoSchema = z.object({ ... });
   
   /**
    * User domain model
    * Converts snake_case to camelCase
    * Converts date strings to Date objects
    */
   export const userSchema = userDtoSchema.transform(...);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Advanced (30분+):

1. Add comprehensive validation tests
   
   // schema.test.ts
   describe('userSchema', () => {
     it('should validate correct user data', () => {
       const result = userSchema.safeParse(validData);
       expect(result.success).toBe(true);
     });
     
     it('should reject invalid email', () => {
       const result = userSchema.safeParse({ email: 'invalid' });
       expect(result.success).toBe(false);
       expect(result.error?.errors[0].message).toBe('Please enter a valid email address');
     });
   });

2. Create schema generator utility
   
   // For repetitive patterns
   const createTimestampSchema = () => z.object({
     createdAt: z.string().datetime().transform(d => new Date(d)),
     updatedAt: z.string().datetime().transform(d => new Date(d)),
   });
```

## 예시

### 예시 1: 파일 검증

```
사용자: /validate-schema

질문 1: 검증 대상?
답변: entities/user/model/schema.ts

질문 2: 검증 레벨?
답변: standard

→ 표준 검증 실행
→ 개선 방안 제시
```

### 예시 2: 디렉토리 전체 검증

```
사용자: /validate-schema

답변: entities/, strict

→ entities 레이어의 모든 스키마 검증
→ 엄격한 기준 적용
```

## 검증 기준

### Error Message Quality

```typescript
// ❌ Bad: No message
email: z.string().email(),

// ⚠️ Fair: Generic message
email: z.string().email('Invalid email'),

// ✅ Good: Clear, actionable message
email: z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address'),
```

### Schema Organization

```typescript
// ❌ Bad: Mixed concerns
export const userSchema = z.object({
  id: z.number().transform(String),
  user_name: z.string(), // API format
  displayName: z.string(), // Domain format
});

// ✅ Good: Separated DTO and domain
export const userDtoSchema = z.object({
  id: z.number(),
  user_name: z.string(),
});

export const userSchema = userDtoSchema.transform(dto => ({
  id: dto.id.toString(),
  userName: dto.user_name,
}));
```

### Type Safety

```typescript
// ❌ Bad: Manual type definition (out of sync risk)
export interface User {
  id: string;
  name: string;
}
export const userSchema = z.object({ ... });

// ✅ Good: Inferred from schema (always in sync)
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type User = z.infer<typeof userSchema>;
```

## Common Issues

### Issue 1: Missing Error Messages

```typescript
// ❌ Before
password: z.string().min(8),

// ✅ After
password: z.string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters'),
```

### Issue 2: Inefficient Validation

```typescript
// ❌ Before: Multiple async checks in series
email: z.string()
  .refine(async (e) => await checkFormat(e))
  .refine(async (e) => await checkExists(e))
  .refine(async (e) => await checkBlacklist(e)),

// ✅ After: Combined check
email: z.string().refine(
  async (e) => {
    const [isValidFormat, exists, isBlacklisted] = await Promise.all([
      checkFormat(e),
      checkExists(e),
      checkBlacklist(e),
    ]);
    return isValidFormat && !exists && !isBlacklisted;
  },
  'Invalid email or already registered'
),
```

### Issue 3: Not Handling Edge Cases

```typescript
// ❌ Before
age: z.number().min(18),

// ✅ After
age: z.number()
  .int('Age must be a whole number')
  .min(18, 'Must be at least 18 years old')
  .max(120, 'Please enter a valid age')
  .finite('Age must be a finite number'),
```

## Best Practices Checklist

- [ ] All schemas have custom error messages
- [ ] DTO and domain schemas are separated
- [ ] Types are inferred from schemas (not manually defined)
- [ ] Reusable validators are extracted
- [ ] Async validations are optimized
- [ ] Edge cases are handled
- [ ] Schemas have JSDoc comments
- [ ] Tests cover validation cases

## 후속 작업

스키마 검증 후:

1. **개선 적용**: 제안된 변경사항 적용
2. **테스트 작성**: 스키마 검증 테스트 추가
3. **문서화**: 스키마 사용법 문서화
4. **재검증**: /validate-schema 재실행하여 개선 확인

