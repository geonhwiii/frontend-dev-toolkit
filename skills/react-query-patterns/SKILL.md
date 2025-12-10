---
name: react-query-patterns
description: Helps implement React Query (TanStack Query) patterns with best practices. Use when setting up data fetching, creating queries, mutations, implementing queryOptions factory, queryKeyFactory, custom hooks with useSuspenseQuery, optimistic updates, or when user mentions React Query, TanStack Query, useQuery, useSuspenseQuery, useMutation, queryOptions, data fetching, API integration, cache management, or server state.
---

# React Query Patterns Skill

This skill helps implement React Query (TanStack Query) patterns following best practices for type-safe, maintainable data fetching in React applications, especially when integrated with FSD architecture.

## Overview

React Query (TanStack Query) is a powerful data synchronization library for React that provides declarative, automatic, and efficient data fetching, caching, and state management for server state.

## Capabilities

### 1. Query Setup
- Create queryOptions factories for reusable query configurations
- Implement queryKeyFactory for hierarchical query key management
- Setup QueryClient with optimal default configurations
- Create custom hooks wrapping useSuspenseQuery

### 2. Mutation Patterns
- Implement mutations with proper error handling
- Setup optimistic updates for better UX
- Configure cache invalidation strategies
- Handle loading and error states declaratively

### 3. FSD Integration
- Place queries in entities layer (api segment)
- Place mutations in features layer (api segment)
- Configure shared QueryClient in shared/api
- Follow Public API pattern for query exports

### 4. Best Practices
- Prefer useSuspenseQuery over useQuery for simpler components
- Use queryOptions for type safety and reusability
- Implement hierarchical query keys for granular cache control
- Separate API functions from query definitions

## Core Patterns

### Pattern 1: queryKeyFactory (계층적 쿼리 키 관리)

```typescript
// entities/user/api/user.keys.ts
export const userKeys = {
  all: ['user'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Benefits:
// - Hierarchical invalidation: invalidate all user queries or specific ones
// - Type-safe keys with const assertions
// - Easy cache management
```

**사용 예시:**
```typescript
// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: userKeys.all });

// Invalidate only user lists
queryClient.invalidateQueries({ queryKey: userKeys.lists() });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: userKeys.detail('123') });
```

### Pattern 2: queryOptions Factory (재사용 가능한 쿼리 정의)

```typescript
// entities/user/api/user.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { userApi } from './user.api';
import { userKeys } from './user.keys';

export const userQueries = {
  all: (filters?: UserFilters) =>
    queryOptions({
      queryKey: userKeys.list(filters),
      queryFn: () => userApi.getAll(filters),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: userKeys.detail(id),
      queryFn: () => userApi.getById(id),
      staleTime: 1000 * 60 * 5,
    }),
};

// Benefits:
// - Type-safe query configuration
// - Reusable across components
// - Easy to test
// - Centralized query logic
```

### Pattern 3: Custom Hook with useSuspenseQuery

```typescript
// features/user-profile/api/useUserProfile.ts
import { useSuspenseQuery } from '@tanstack/react-query';
import { userQueries } from '@/entities/user';

export function useUserProfile(id: string) {
  return useSuspenseQuery(userQueries.detail(id));
}

// Usage in component:
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useUserProfile(userId);
  // No loading state needed - Suspense handles it
  return <div>{user.name}</div>;
}

// Wrap with Suspense + ErrorBoundary:
function UserProfilePage({ userId }: { userId: string }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile userId={userId} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Pattern 4: Mutation with Optimistic Updates

```typescript
// features/edit-user/api/useUpdateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys } from '@/entities/user';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: Partial<User> }) =>
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
    },
  });
}
```

### Pattern 5: API Client (공통 API 클라이언트)

```typescript
// shared/api/client.ts
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor(config: { baseURL: string }) {
    this.client = axios.create(config);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: any) {
    const response = await this.client.get<T>(url, config);
    return response;
  }

  async post<T>(url: string, data?: any, config?: any) {
    const response = await this.client.post<T>(url, data, config);
    return response;
  }

  // ... other methods
}

export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

## FSD Integration

### Entities Layer: Queries (데이터 읽기)

```
entities/user/
├── api/
│   ├── user.queries.ts      # queryOptions factories
│   ├── user.keys.ts         # Query key factory
│   ├── user.api.ts          # API functions
│   └── index.ts             # Export queries, keys, api
└── index.ts                 # Public API
```

### Features Layer: Mutations (데이터 쓰기)

```
features/edit-user/
├── api/
│   ├── useUpdateUser.ts     # Mutation hook
│   └── index.ts
└── index.ts                 # Public API
```

### Shared Layer: Configuration

```
shared/api/
├── client.ts                # API client
├── query-client.ts          # QueryClient config
└── index.ts
```

## When This Skill Activates

This skill automatically activates when the user:

- Mentions "React Query" or "TanStack Query"
- Wants to setup data fetching in the project
- Needs to create queries or mutations
- Asks about useQuery, useSuspenseQuery, useMutation
- Wants to implement queryOptions or queryKeyFactory
- Needs help with cache invalidation
- Asks about optimistic updates
- Wants to integrate React Query with FSD architecture

## Usage Examples

### Example 1: Setting Up React Query

**User**: "React Query를 프로젝트에 설정해줘"

**Response**:
1. Install dependencies:
   ```bash
   npm install @tanstack/react-query @tanstack/react-query-devtools
   ```

2. Create QueryClient configuration:
   ```typescript
   // shared/api/query-client.ts
   import { QueryClient } from '@tanstack/react-query';

   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 1000 * 60 * 5,
         gcTime: 1000 * 60 * 10,
         retry: 1,
         refetchOnWindowFocus: false,
       },
     },
   });
   ```

3. Setup Provider in app layer:
   ```typescript
   // app/providers/QueryProvider.tsx
   import { QueryClientProvider } from '@tanstack/react-query';
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
   import { queryClient } from '@/shared/api/query-client';

   export function QueryProvider({ children }) {
     return (
       <QueryClientProvider client={queryClient}>
         {children}
         <ReactQueryDevtools initialIsOpen={false} />
       </QueryClientProvider>
     );
   }
   ```

### Example 2: Creating Entity with Queries

**User**: "product entity에 React Query 설정해줘"

**Response**: Generate complete structure:

```typescript
// entities/product/api/product.keys.ts
export const productKeys = {
  all: ['product'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// entities/product/api/product.queries.ts
export const productQueries = {
  all: (filters?: ProductFilters) =>
    queryOptions({
      queryKey: productKeys.list(filters),
      queryFn: () => productApi.getAll(filters),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: productKeys.detail(id),
      queryFn: () => productApi.getById(id),
    }),
};

// entities/product/index.ts
export { productQueries, productKeys } from './api';
```

### Example 3: Creating Feature with Mutation

**User**: "add-to-cart 기능을 만들고 싶어"

**Response**:

```typescript
// features/add-to-cart/api/useAddToCart.ts
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AddToCartParams) =>
      cartApi.addItem(params),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
}

// features/add-to-cart/ui/AddToCartButton.tsx
export function AddToCartButton({ productId }) {
  const { mutate, isPending } = useAddToCart();

  return (
    <button
      onClick={() => mutate({ productId, quantity: 1 })}
      disabled={isPending}
    >
      {isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

## Best Practices

### 1. Query Organization

**✅ Good:**
```typescript
// Entities: Basic CRUD queries
// entities/user/api/user.queries.ts
export const userQueries = {
  all: (filters?) => queryOptions({ ... }),
  detail: (id) => queryOptions({ ... }),
};
```

**❌ Bad:**
```typescript
// Don't put business logic in entity queries
export const userQueries = {
  currentUserWithOrders: () => queryOptions({ ... }), // Too specific
};
```

### 2. Mutation Placement

**✅ Good:**
```typescript
// Features: Business logic mutations
// features/checkout/api/useCheckout.ts
export function useCheckout() {
  return useMutation({
    mutationFn: checkoutApi.process,
    // Business logic here
  });
}
```

**❌ Bad:**
```typescript
// Don't put mutations in entities
// entities/user/api/user.mutations.ts
export function useUpdateUser() { ... } // Should be in features
```

### 3. Cache Invalidation

**✅ Good:**
```typescript
// Hierarchical invalidation
queryClient.invalidateQueries({ queryKey: userKeys.all }); // All user queries
queryClient.invalidateQueries({ queryKey: userKeys.lists() }); // Only lists
queryClient.invalidateQueries({ queryKey: userKeys.detail('123') }); // Specific user
```

**❌ Bad:**
```typescript
// Manual string keys - not type-safe
queryClient.invalidateQueries({ queryKey: ['user'] });
queryClient.invalidateQueries({ queryKey: ['user', 'list'] });
```

### 4. Suspense Pattern

**✅ Good:**
```typescript
// Use useSuspenseQuery with Suspense boundary
function UserProfile({ id }) {
  const { data: user } = useSuspenseQuery(userQueries.detail(id));
  return <div>{user.name}</div>; // No null checks needed
}

// Wrap with Suspense
<Suspense fallback={<Loading />}>
  <UserProfile id="123" />
</Suspense>
```

**❌ Bad:**
```typescript
// Using useQuery and manual loading states
function UserProfile({ id }) {
  const { data: user, isLoading } = useQuery(userQueries.detail(id));
  if (isLoading) return <Loading />;
  if (!user) return null;
  return <div>{user.name}</div>;
}
```

## Common Patterns

### Pattern: Dependent Queries

```typescript
// Query that depends on another query
function useUserOrders(userId: string) {
  const { data: user } = useSuspenseQuery(userQueries.detail(userId));

  return useSuspenseQuery(
    orderQueries.byUser(user.id, { enabled: !!user.id })
  );
}
```

### Pattern: Infinite Queries

```typescript
export const productQueries = {
  infinite: (filters?: ProductFilters) =>
    infiniteQueryOptions({
      queryKey: productKeys.list(filters),
      queryFn: ({ pageParam = 1 }) =>
        productApi.getAll({ ...filters, page: pageParam }),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 1,
    }),
};
```

### Pattern: Prefetching

```typescript
function ProductList() {
  const queryClient = useQueryClient();

  const handleMouseEnter = (productId: string) => {
    // Prefetch on hover
    queryClient.prefetchQuery(productQueries.detail(productId));
  };

  return (
    <div>
      {products.map(product => (
        <div key={product.id} onMouseEnter={() => handleMouseEnter(product.id)}>
          {product.name}
        </div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Issue: "Query is not refetching"

**Solution**:
1. Check staleTime configuration - queries won't refetch if not stale
2. Use `refetchInterval` for polling
3. Manually refetch with `queryClient.invalidateQueries()`

### Issue: "Optimistic update not working"

**Solution**:
1. Cancel outgoing queries before updating cache
2. Return context from onMutate for rollback
3. Use setQueryData with updater function

### Issue: "Too many re-renders with useQuery"

**Solution**:
1. Use useSuspenseQuery instead for simpler logic
2. Check if query key is stable (use const assertions)
3. Memoize complex query keys

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [FSD + React Query Guide](https://feature-sliced.design/docs/guides/tech/with-react-query)

---

## Implementation Details

When activated, this skill will:

1. **Setup**: Configure QueryClient and Provider
2. **Generate**: Create queryOptions, queryKeyFactory, and hooks
3. **Guide**: Suggest proper placement in FSD layers
4. **Validate**: Check for best practices and patterns
5. **Integrate**: Ensure proper integration with existing architecture

The skill prioritizes type safety, maintainability, and performance through established patterns.

