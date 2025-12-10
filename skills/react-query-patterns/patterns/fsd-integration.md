# FSD + React Query Integration Guide

React Query와 Feature-Sliced Design(FSD) 아키텍처를 통합하는 방법에 대한 가이드입니다.

## 개요

React Query를 FSD 아키텍처와 통합할 때 다음 원칙을 따릅니다:

1. **Queries (읽기)** → **Entities Layer**에 배치
2. **Mutations (쓰기)** → **Features Layer**에 배치
3. **QueryClient 설정** → **Shared Layer**에 배치
4. **Provider 설정** → **App Layer**에 배치

## Layer별 배치 규칙

### 1. Shared Layer (공통 인프라)

#### 위치: `shared/api/`

```
shared/api/
├── client.ts          # API Client (axios)
├── query-client.ts    # QueryClient 설정
└── index.ts          # Public exports
```

#### query-client.ts

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      gcTime: 1000 * 60 * 10,   // 10분 (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### 2. App Layer (Provider 설정)

#### 위치: `app/providers/QueryProvider.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/shared/api/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

#### App.tsx에서 사용

```typescript
import { QueryProvider } from './providers/QueryProvider';

export function App() {
  return (
    <QueryProvider>
      <Router />
    </QueryProvider>
  );
}
```

### 3. Entities Layer (Queries - 읽기 작업)

#### 위치: `entities/{entity}/api/`

```
entities/user/
├── model/
│   ├── types.ts
│   └── index.ts
├── api/
│   ├── user.queries.ts     # ⭐ queryOptions factories
│   ├── user.keys.ts        # ⭐ Query key factory
│   ├── user.api.ts         # ⭐ API functions
│   └── index.ts
└── index.ts
```

#### user.keys.ts (Query Key Factory)

```typescript
export const userKeys = {
  all: ['user'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
```

#### user.queries.ts (queryOptions Factory)

```typescript
import { queryOptions } from '@tanstack/react-query';
import { userApi } from './user.api';
import { userKeys } from './user.keys';

export const userQueries = {
  all: (filters?: UserFilters) =>
    queryOptions({
      queryKey: userKeys.list(filters),
      queryFn: () => userApi.getAll(filters),
      staleTime: 1000 * 60 * 5,
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: userKeys.detail(id),
      queryFn: () => userApi.getById(id),
      staleTime: 1000 * 60 * 5,
    }),
};
```

#### user.api.ts (API Functions)

```typescript
import { apiClient } from '@/shared/api/client';
import type { User, UserDto } from '../model';

export const userApi = {
  async getAll(filters?: UserFilters): Promise<User[]> {
    const response = await apiClient.get<UserDto[]>('/users', { params: filters });
    return response.data.map(mapDtoToDomain);
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<UserDto>(`/users/${id}`);
    return mapDtoToDomain(response.data);
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    const response = await apiClient.post<UserDto>('/users', data);
    return mapDtoToDomain(response.data);
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<UserDto>(`/users/${id}`, data);
    return mapDtoToDomain(response.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
```

#### entities/user/index.ts (Public API)

```typescript
export type { User, UserDto, UserFilters } from './model';
export { userQueries, userKeys, userApi } from './api';
```

### 4. Features Layer (Mutations - 쓰기 작업)

#### 위치: `features/{feature}/api/`

```
features/edit-user/
├── api/
│   ├── useUpdateUser.ts    # ⭐ Mutation hook
│   └── index.ts
├── ui/
│   ├── EditUserForm.tsx
│   └── index.ts
└── index.ts
```

#### useUpdateUser.ts (Mutation Hook)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys } from '@/entities/user';
import type { User } from '@/entities/user';

interface UpdateUserParams {
  id: string;
  data: Partial<User>;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateUserParams) =>
      userApi.update(params.id, params.data),

    // Optimistic update
    onMutate: async (params) => {
      await queryClient.cancelQueries({
        queryKey: userKeys.detail(params.id)
      });

      const previousUser = queryClient.getQueryData(
        userKeys.detail(params.id)
      );

      queryClient.setQueryData(
        userKeys.detail(params.id),
        (old: User) => ({ ...old, ...params.data })
      );

      return { previousUser };
    },

    // Rollback on error
    onError: (err, params, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(params.id),
          context.previousUser
        );
      }
    },

    // Refetch on success/error
    onSettled: (data, error, params) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(params.id)
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.lists()
      });
    },
  });
}
```

#### features/edit-user/index.ts (Public API)

```typescript
export { useUpdateUser } from './api';
export { EditUserForm } from './ui';
```

### 5. Pages/Widgets Layer (사용)

#### pages/UserProfilePage.tsx

```typescript
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import { userQueries } from '@/entities/user';
import { useUpdateUser, EditUserForm } from '@/features/edit-user';

function UserProfilePage({ userId }: { userId: string }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfileContent userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function UserProfileContent({ userId }: { userId: string }) {
  const { data: user } = useSuspenseQuery(userQueries.detail(userId));
  const { mutate: updateUser } = useUpdateUser();

  return (
    <div>
      <h1>{user.name}</h1>
      <EditUserForm
        user={user}
        onSubmit={(data) => updateUser({ id: userId, data })}
      />
    </div>
  );
}
```

## 의존성 규칙

### ✅ 허용되는 Import

```typescript
// Features can import from Entities
// features/edit-user/api/useUpdateUser.ts
import { userApi, userKeys } from '@/entities/user'; // ✅ OK

// Widgets can import from Features and Entities
// widgets/user-profile/ui/UserProfile.tsx
import { userQueries } from '@/entities/user';        // ✅ OK
import { useUpdateUser } from '@/features/edit-user'; // ✅ OK

// Pages can import from Widgets, Features, Entities
// pages/UserProfilePage.tsx
import { UserProfile } from '@/widgets/user-profile'; // ✅ OK
import { userQueries } from '@/entities/user';        // ✅ OK
```

### ❌ 금지되는 Import

```typescript
// Entities CANNOT import from Features
// entities/user/api/user.queries.ts
import { useUpdateUser } from '@/features/edit-user'; // ❌ BAD

// Entities CANNOT import from Widgets
// entities/user/api/user.api.ts
import { UserProfile } from '@/widgets/user-profile'; // ❌ BAD

// Features CANNOT import from other Features (same layer)
// features/edit-user/api/useUpdateUser.ts
import { useDeleteUser } from '@/features/delete-user'; // ❌ BAD (use shared layer)
```

## 베스트 프랙티스

### 1. Entities: 기본 CRUD만

```typescript
// ✅ Good: Simple CRUD queries
export const userQueries = {
  all: (filters?) => queryOptions({ ... }),
  detail: (id) => queryOptions({ ... }),
};

// ❌ Bad: Business logic in entities
export const userQueries = {
  currentUserWithOrdersAndSettings: () => queryOptions({ ... }), // Too specific
};
```

### 2. Features: 비즈니스 로직

```typescript
// ✅ Good: Business logic in features
export function useCheckoutUser() {
  const { mutate } = useMutation({
    mutationFn: async (params) => {
      // Complex business logic
      const user = await userApi.getById(params.id);
      const orders = await orderApi.getByUser(user.id);
      return await checkoutApi.process({ user, orders });
    },
  });
}
```

### 3. Public API를 통한 Export

```typescript
// entities/user/index.ts
export { userQueries, userKeys, userApi } from './api';
export type { User } from './model';

// ✅ Good: Import from public API
import { userQueries } from '@/entities/user';

// ❌ Bad: Direct import
import { userQueries } from '@/entities/user/api/user.queries';
```

### 4. useSuspenseQuery 선호

```typescript
// ✅ Good: Using Suspense
function UserProfile({ id }) {
  const { data: user } = useSuspenseQuery(userQueries.detail(id));
  return <div>{user.name}</div>; // No null checks needed
}

// Wrap with Suspense boundary
<Suspense fallback={<Loading />}>
  <UserProfile id="123" />
</Suspense>

// ❌ Bad: Manual loading states
function UserProfile({ id }) {
  const { data: user, isLoading } = useQuery(userQueries.detail(id));
  if (isLoading) return <Loading />;
  if (!user) return null;
  return <div>{user.name}</div>;
}
```

### 5. 계층적 Query Keys

```typescript
// ✅ Good: Hierarchical invalidation
queryClient.invalidateQueries({ queryKey: userKeys.all });      // All user queries
queryClient.invalidateQueries({ queryKey: userKeys.lists() });  // Only lists
queryClient.invalidateQueries({ queryKey: userKeys.detail('123') }); // Specific user

// ❌ Bad: Flat keys
queryClient.invalidateQueries({ queryKey: ['user'] });
queryClient.invalidateQueries({ queryKey: ['user-list'] });
```

## 전체 예시

### 프로젝트 구조

```
src/
├── app/
│   ├── providers/
│   │   └── QueryProvider.tsx        # React Query Provider
│   └── index.tsx
├── pages/
│   └── UserProfilePage.tsx          # Page using queries & mutations
├── widgets/
│   └── user-profile/
│       └── ui/UserProfile.tsx       # Widget composing features
├── features/
│   ├── edit-user/
│   │   ├── api/
│   │   │   ├── useUpdateUser.ts     # ⭐ Mutation
│   │   │   └── index.ts
│   │   ├── ui/EditUserForm.tsx
│   │   └── index.ts
│   └── delete-user/
│       ├── api/useDeleteUser.ts     # ⭐ Mutation
│       └── ui/DeleteUserButton.tsx
├── entities/
│   └── user/
│       ├── model/
│       │   ├── types.ts
│       │   └── index.ts
│       ├── api/
│       │   ├── user.queries.ts      # ⭐ Queries
│       │   ├── user.keys.ts         # ⭐ Query keys
│       │   ├── user.api.ts          # ⭐ API functions
│       │   └── index.ts
│       └── index.ts
└── shared/
    └── api/
        ├── client.ts                # ⭐ API Client
        ├── query-client.ts          # ⭐ QueryClient config
        └── index.ts
```

## 요약

| Layer | React Query 역할 | 배치 내용 |
|-------|----------------|----------|
| **shared** | 인프라 | API Client, QueryClient 설정 |
| **app** | Provider | QueryClientProvider 설정 |
| **entities** | Queries (읽기) | queryOptions, queryKeys, API 함수 |
| **features** | Mutations (쓰기) | useMutation 훅, 비즈니스 로직 |
| **widgets/pages** | 사용 | useSuspenseQuery로 데이터 페칭 |

이 구조를 따르면:
- ✅ 명확한 책임 분리
- ✅ 재사용 가능한 쿼리/뮤테이션
- ✅ 타입 안전성
- ✅ 쉬운 테스트
- ✅ FSD 의존성 규칙 준수

