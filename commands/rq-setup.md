---
description: Setup React Query (TanStack Query) in the project with QueryClient, Provider, and best practices configuration
---

# React Query Setup Command

React Query를 프로젝트에 설정하고 FSD 아키텍처와 통합합니다.

## 이 커맨드가 하는 일

1. **Dependencies 설치**: @tanstack/react-query, @tanstack/react-query-devtools
2. **QueryClient 설정**: shared/api/query-client.ts 생성
3. **Provider 설정**: app/providers/QueryProvider.tsx 생성
4. **API Client 생성**: shared/api/client.ts 생성
5. **TypeScript 타입 설정**: 필요한 타입 정의

## 실행 단계

### 1. 사용자에게 확인

다음 질문들을 합니다:

**질문 1: 패키지 매니저**
- "어떤 패키지 매니저를 사용하시나요?"
- 옵션: npm, yarn, pnpm
- 기본값: npm

**질문 2: DevTools 포함 여부**
- "React Query DevTools를 포함하시겠습니까?"
- 옵션: Yes (권장), No
- 기본값: Yes

**질문 3: API Client**
- "API Client를 생성하시겠습니까?"
- 옵션: Yes (권장), No
- 기본값: Yes

**질문 4: 기본 staleTime**
- "기본 staleTime을 설정하시겠습니까? (분 단위)"
- 기본값: 5 (5분)

### 2. Dependencies 설치

선택한 패키지 매니저로 설치:

```bash
# npm
npm install @tanstack/react-query @tanstack/react-query-devtools

# yarn
yarn add @tanstack/react-query @tanstack/react-query-devtools

# pnpm
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

API Client를 생성하는 경우 ky도 설치:

```bash
npm install ky
```

### 3. QueryClient 설정 파일 생성

#### 파일: `shared/api/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance
 * 
 * Configuration:
 * - staleTime: {{staleTime}} minutes - data considered fresh
 * - gcTime: {{gcTime}} minutes - cache garbage collection time
 * - retry: 1 - retry failed requests once
 * - refetchOnWindowFocus: false - don't refetch when window regains focus
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * {{staleTime}}, // {{staleTime}} minutes
      gcTime: 1000 * 60 * {{gcTime}}, // {{gcTime}} minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations by default
    },
  },
});
```

#### 파일: `shared/api/index.ts`

```typescript
export { queryClient } from './query-client';
{{#if includeApiClient}}
export { apiClient, ApiError } from './client';
{{/if}}
```

### 4. API Client 생성 (선택 사항)

API Client를 생성하는 경우:

#### 파일: `shared/api/client.ts`

```typescript
import ky, { type KyInstance, type Options, type BeforeRequestHook, type AfterResponseHook } from 'ky';

/**
 * API Client configuration options
 */
export interface ApiClientConfig {
  prefixUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: number;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Production-ready API Client using ky
 */
export class ApiClient {
  private client: KyInstance;

  constructor(config: ApiClientConfig) {
    this.client = ky.create({
      prefixUrl: config.prefixUrl,
      timeout: config.timeout || 30000,
      retry: config.retry ?? 1,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      hooks: {
        beforeRequest: [(request) => {
          const token = localStorage.getItem('auth_token');
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }],
        afterResponse: [async (request, options, response) => {
          if (!response.ok && response.status === 401) {
            // Handle unauthorized
            localStorage.removeItem('auth_token');
            // Optionally redirect to login
          }
          
          if (!response.ok) {
            let data: any;
            try {
              data = await response.json();
            } catch {
              data = { message: response.statusText };
            }
            
            throw new ApiError(
              data?.message || response.statusText || 'An error occurred',
              response.status,
              data?.code,
              data
            );
          }
          
          return response;
        }],
      },
    });
  }

  async get<T>(url: string, options?: Options): Promise<T> {
    return this.client.get(url, options).json<T>();
  }

  async post<T>(url: string, data?: any, options?: Options): Promise<T> {
    return this.client.post(url, { ...options, json: data }).json<T>();
  }

  async put<T>(url: string, data?: any, options?: Options): Promise<T> {
    return this.client.put(url, { ...options, json: data }).json<T>();
  }

  async patch<T>(url: string, data?: any, options?: Options): Promise<T> {
    return this.client.patch(url, { ...options, json: data }).json<T>();
  }

  async delete<T>(url: string, options?: Options): Promise<T> {
    return this.client.delete(url, options).json<T>();
  }

  async deleteNoContent(url: string, options?: Options): Promise<void> {
    await this.client.delete(url, options);
  }
}

/**
 * Default API client instance
 * Set VITE_API_BASE_URL in your .env file
 */
export const apiClient = new ApiClient({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
});
```

### 5. QueryProvider 생성

#### 파일: `app/providers/QueryProvider.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
{{#if includeDevTools}}
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
{{/if}}
import { queryClient } from '@/shared/api/query-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * React Query Provider component
 * Wraps the app with QueryClientProvider and DevTools
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {{#if includeDevTools}}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
      {{/if}}
    </QueryClientProvider>
  );
}
```

#### 파일: `app/providers/index.ts`

```typescript
export { QueryProvider } from './QueryProvider';
```

### 6. App에 Provider 통합

기존 `app/index.tsx` 또는 `main.tsx`를 업데이트합니다:

#### Before:
```typescript
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### After:
```typescript
import { App } from './App';
import { QueryProvider } from './providers/QueryProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);
```

### 7. 환경 변수 설정

`.env` 파일에 API Base URL 추가:

```env
# .env
VITE_API_BASE_URL=https://api.example.com
```

`.env.example` 파일도 생성:

```env
# .env.example
VITE_API_BASE_URL=https://api.example.com
```

### 8. TypeScript 설정 확인

`tsconfig.json`에 path alias가 설정되어 있는지 확인:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/shared/*": ["src/shared/*"],
      "@/app/*": ["src/app/*"]
    }
  }
}
```

### 9. 요약 출력

설정 완료 후 다음 정보를 표시:

```
✅ React Query 설정 완료!

생성된 파일:
- shared/api/query-client.ts       # QueryClient 설정
{{#if includeApiClient}}
- shared/api/client.ts              # API Client
{{/if}}
- app/providers/QueryProvider.tsx   # React Query Provider
- .env.example                      # 환경 변수 예시

설정:
- staleTime: {{staleTime}}분
- gcTime: {{gcTime}}분
- retry: 1회
{{#if includeDevTools}}
- DevTools: 개발 환경에서 활성화
{{/if}}

다음 단계:
1. .env 파일에 VITE_API_BASE_URL 설정
2. Entity 생성: /rq-entity
3. 첫 쿼리 작성:
   ```typescript
   import { useSuspenseQuery } from '@tanstack/react-query';
   import { userQueries } from '@/entities/user';
   
   const { data: user } = useSuspenseQuery(userQueries.detail('123'));
   ```

참고 자료:
- TanStack Query 공식 문서: https://tanstack.com/query/latest
- FSD + React Query 가이드: skills/react-query-patterns/patterns/fsd-integration.md
```

## 예시

### 예시 1: 기본 설정

```
사용자: /rq-setup

시스템: React Query를 설정합니다.

질문 1: 패키지 매니저? (npm/yarn/pnpm)
답변: npm

질문 2: DevTools 포함? (Y/n)
답변: Y

질문 3: API Client 생성? (Y/n)
답변: Y

질문 4: staleTime (분)? (기본: 5)
답변: 5

→ Dependencies 설치
→ 파일 생성
→ 설정 완료 메시지
```

### 예시 2: 최소 설정

```
사용자: /rq-setup

답변: n, n, 3

결과:
- QueryClient만 생성
- DevTools 제외
- API Client 제외
- staleTime: 3분
```

## 검증

설정 완료 후 다음 사항을 확인합니다:

1. **Dependencies 설치 확인**
   ```bash
   npm list @tanstack/react-query
   ```

2. **파일 생성 확인**
   - shared/api/query-client.ts 존재
   - app/providers/QueryProvider.tsx 존재

3. **Provider 연결 확인**
   - App이 QueryProvider로 감싸져 있는지 확인

4. **DevTools 작동 확인** (포함한 경우)
   - 개발 모드에서 앱 실행
   - 화면 하단에 React Query DevTools 아이콘 표시

## 트러블슈팅

### 문제: "Cannot find module '@tanstack/react-query'"

**해결책**:
```bash
npm install @tanstack/react-query
```

### 문제: "Cannot find module '@/shared/api'"

**해결책**: tsconfig.json에 path alias 설정 확인

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 문제: DevTools가 표시되지 않음

**해결책**:
1. 개발 모드인지 확인 (`npm run dev`)
2. ReactQueryDevtools import 확인
3. 브라우저 콘솔에서 에러 확인

## 후속 작업

React Query 설정 후:

1. **Entity 생성**: `/rq-entity` - Entity에 React Query 통합
2. **첫 쿼리 작성**: entities 레이어에 queries 생성
3. **첫 mutation 작성**: features 레이어에 mutation 생성
4. **테스트**: useSuspenseQuery로 데이터 페칭 테스트

