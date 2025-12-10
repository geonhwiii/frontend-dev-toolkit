---
name: zod-validation
description: Helps implement Zod validation for API responses, form inputs, and data transformation. Use when creating validation schemas, transforming DTOs, validating forms with React Hook Form, type-safe runtime validation, or when user mentions Zod, validation, schema, form validation, API validation, or DTO transformation.
---

# Zod Validation Skill

타입 안전한 런타임 검증을 위한 Zod 스키마 생성 및 적용 가이드입니다.

## Overview

Zod는 TypeScript-first 스키마 선언 및 검증 라이브러리로, 런타임 타입 안전성과 자동 타입 추론을 제공합니다.

## Capabilities

### 1. API 스키마 생성
- DTO to Domain 변환 스키마
- API 응답 검증
- 자동 타입 추론
- 에러 핸들링

### 2. Form 검증
- React Hook Form 통합
- 실시간 검증
- 커스텀 에러 메시지
- 다단계 검증

### 3. 데이터 변환
- snake_case ↔ camelCase
- 날짜 문자열 → Date 객체
- 숫자 문자열 → Number
- 중첩 객체 변환

### 4. 검증 패턴
- 조건부 검증
- 커스텀 검증 규칙
- 스키마 합성
- Refinement

## Core Patterns

### Pattern 1: API 스키마 (DTO 변환)

```typescript
// entities/user/model/schema.ts
import { z } from 'zod';

/**
 * User DTO schema (from API)
 */
const userDtoSchema = z.object({
  id: z.number(),
  user_name: z.string(),
  email_address: z.string().email(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  profile_image_url: z.string().url().nullable(),
  is_active: z.boolean(),
});

/**
 * User domain schema with transformation
 */
export const userSchema = userDtoSchema.transform((dto) => ({
  id: dto.id.toString(),
  userName: dto.user_name,
  emailAddress: dto.email_address,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
  profileImageUrl: dto.profile_image_url,
  isActive: dto.is_active,
}));

/**
 * Infer TypeScript type from schema
 */
export type User = z.infer<typeof userSchema>;
export type UserDto = z.infer<typeof userDtoSchema>;
```

**사용 예시:**
```typescript
// entities/user/api/user.api.ts
import { userSchema } from '../model/schema';

export const userApi = {
  async getById(id: string): Promise<User> {
    const response = await apiClient.get(`users/${id}`);
    
    // Runtime validation + transformation
    const user = userSchema.parse(response);
    return user;
  },
};
```

### Pattern 2: Form 스키마 (React Hook Form)

```typescript
// features/user-registration/model/schema.ts
import { z } from 'zod';

/**
 * User registration form schema
 */
export const registrationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string(),
  
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  
  age: z
    .number()
    .int('Age must be an integer')
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Invalid age'),
  
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, 'You must agree to terms'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // Error path
  }
);

export type RegistrationFormData = z.infer<typeof registrationSchema>;
```

**사용 예시:**
```typescript
// features/user-registration/ui/RegistrationForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, type RegistrationFormData } from '../model/schema';

export function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur', // Validate on blur
  });

  const onSubmit = async (data: RegistrationFormData) => {
    // data is fully validated and typed
    await registerUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('email')} type="email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <input {...register('password')} type="password" />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <div>
        <input {...register('confirmPassword')} type="password" />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>

      <div>
        <input {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <input {...register('age', { valueAsNumber: true })} type="number" />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <div>
        <input {...register('agreeToTerms')} type="checkbox" />
        {errors.agreeToTerms && <span>{errors.agreeToTerms.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Register'}
      </button>
    </form>
  );
}
```

### Pattern 3: 조건부 검증

```typescript
// 배송 정보 스키마 (배송 방법에 따라 다른 필드 required)
export const shippingSchema = z.discriminatedUnion('method', [
  // 택배 배송
  z.object({
    method: z.literal('delivery'),
    address: z.string().min(10, 'Address is required'),
    zipCode: z.string().regex(/^\d{5}$/, 'Invalid zip code'),
    phone: z.string().regex(/^\d{10,11}$/, 'Invalid phone number'),
  }),
  
  // 매장 픽업
  z.object({
    method: z.literal('pickup'),
    storeId: z.string().min(1, 'Store selection is required'),
    pickupTime: z.date(),
  }),
]);

export type ShippingInfo = z.infer<typeof shippingSchema>;
```

### Pattern 4: 배열 및 중첩 객체 검증

```typescript
// 주문 스키마
export const orderSchema = z.object({
  orderId: z.string().uuid(),
  customerId: z.string(),
  
  items: z.array(
    z.object({
      productId: z.string(),
      productName: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ).min(1, 'At least one item is required'),
  
  totalAmount: z.number().positive(),
  
  shippingInfo: shippingSchema,
  
  paymentMethod: z.enum(['card', 'bank_transfer', 'cash']),
  
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (data) => {
    // 총액 검증
    const itemsTotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return Math.abs(itemsTotal - data.totalAmount) < 0.01; // 부동소수점 오차 허용
  },
  {
    message: 'Total amount does not match items sum',
    path: ['totalAmount'],
  }
);
```

### Pattern 5: 부분 검증 및 Pick/Omit

```typescript
// 전체 스키마
const fullUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
  age: z.number(),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 생성 시 필요한 필드만
export const createUserSchema = fullUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 업데이트 시 모든 필드 optional
export const updateUserSchema = fullUserSchema
  .omit({ id: true, createdAt: true })
  .partial();

// 특정 필드만 선택
export const userProfileSchema = fullUserSchema.pick({
  name: true,
  email: true,
  age: true,
});

export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
```

### Pattern 6: 커스텀 검증 (Refinement)

```typescript
// 비밀번호 강도 검증
export const strongPasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[!@#$%^&*]/.test(password),
    'Password must contain at least one special character'
  );

// 날짜 범위 검증
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// 고유값 검증 (비동기)
export const emailSchema = z.string().email().refine(
  async (email) => {
    const exists = await checkEmailExists(email);
    return !exists;
  },
  {
    message: 'Email already exists',
  }
);
```

## FSD Integration

### Entities Layer: Domain 스키마

```
entities/user/
├── model/
│   ├── schema.ts        # Zod schemas
│   ├── types.ts         # Exported types
│   └── index.ts
└── index.ts
```

```typescript
// entities/user/model/schema.ts
export const userDtoSchema = z.object({ ... });
export const userSchema = userDtoSchema.transform(...);

// entities/user/model/types.ts
import { z } from 'zod';
import { userSchema } from './schema';

export type User = z.infer<typeof userSchema>;

// entities/user/index.ts
export { userSchema } from './model/schema';
export type { User } from './model/types';
```

### Features Layer: Form 스키마

```
features/edit-user/
├── model/
│   ├── schema.ts        # Form validation schema
│   └── index.ts
├── ui/
│   └── EditUserForm.tsx # Uses schema
└── index.ts
```

```typescript
// features/edit-user/model/schema.ts
import { z } from 'zod';

export const editUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18),
});

export type EditUserFormData = z.infer<typeof editUserSchema>;
```

## When This Skill Activates

This skill automatically activates when the user:

- Mentions "Zod" or "validation"
- Wants to validate API responses
- Needs form validation
- Asks about DTO transformation
- Wants type-safe runtime validation
- Mentions schema or data validation
- Wants to integrate with React Hook Form

## Best Practices

### 1. Schema Organization

```typescript
// ✅ Good: Separate DTO and domain schemas
export const userDtoSchema = z.object({ ... });
export const userSchema = userDtoSchema.transform(...);

// ❌ Bad: Mixed validation logic
export const userSchema = z.object({
  id: z.number().transform(String), // Transform inline
  name: z.string(),
});
```

### 2. Error Messages

```typescript
// ✅ Good: Clear, actionable error messages
email: z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address'),

// ❌ Bad: Generic error messages
email: z.string().email('Invalid'),
```

### 3. Type Inference

```typescript
// ✅ Good: Infer types from schemas
const userSchema = z.object({ ... });
export type User = z.infer<typeof userSchema>;

// ❌ Bad: Duplicate type definitions
export interface User { ... }
export const userSchema = z.object({ ... }); // Not in sync
```

### 4. Schema Reusability

```typescript
// ✅ Good: Compose schemas
const baseUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8),
});

export const updateUserSchema = baseUserSchema.partial();

// ❌ Bad: Duplicate schema definitions
```

## Common Patterns

### Pattern: Optional vs Nullable vs Undefined

```typescript
// Optional (field may not exist)
const schema1 = z.object({
  name: z.string().optional(), // { name?: string }
});

// Nullable (field exists but can be null)
const schema2 = z.object({
  name: z.string().nullable(), // { name: string | null }
});

// Both
const schema3 = z.object({
  name: z.string().nullable().optional(), // { name?: string | null }
});

// Default value
const schema4 = z.object({
  name: z.string().default('Unknown'),
});
```

### Pattern: Async Validation

```typescript
export const uniqueEmailSchema = z.string().email().refine(
  async (email) => {
    const exists = await checkEmailExists(email);
    return !exists;
  },
  'Email already registered'
);

// Usage with React Hook Form
const form = useForm({
  resolver: zodResolver(registrationSchema),
  mode: 'onBlur', // Trigger async validation on blur
});
```

### Pattern: Union Types

```typescript
// Tagged union
const notificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    email: z.string().email(),
    subject: z.string(),
  }),
  z.object({
    type: z.literal('sms'),
    phone: z.string(),
    message: z.string(),
  }),
  z.object({
    type: z.literal('push'),
    deviceId: z.string(),
    title: z.string(),
  }),
]);
```

## Error Handling

```typescript
// Parse (throws error)
try {
  const user = userSchema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors);
  }
}

// SafeParse (returns result object)
const result = userSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.errors);
} else {
  console.log(result.data);
}

// Format errors for display
const formatZodError = (error: z.ZodError) => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};
```

## Additional Resources

- [Zod Official Documentation](https://zod.dev)
- [React Hook Form + Zod](https://react-hook-form.com/get-started#SchemaValidation)
- [Zod Error Handling](https://zod.dev/ERROR_HANDLING)

---

## Implementation Details

When activated, this skill will:

1. **Generate**: 적절한 Zod 스키마 생성
2. **Transform**: DTO to Domain 변환 로직 작성
3. **Validate**: 폼 검증 통합
4. **Type**: TypeScript 타입 추론
5. **Handle**: 에러 처리 패턴 제공

The skill prioritizes type safety, maintainability, and clear error messages.

