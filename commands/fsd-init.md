---
description: Initialize Feature-Sliced Design (FSD) architecture structure for a new or existing React project
---

# FSD Init Command

Initialize a complete Feature-Sliced Design (FSD) architecture structure with all necessary layers, configuration files, and React Query setup.

## What This Command Does

This command sets up a full FSD project structure with:

1. **All FSD layers**: app, pages, widgets, features, entities, shared
2. **Shared infrastructure**: API client, utilities, UI components
3. **React Query setup**: QueryClient configuration and provider
4. **Configuration files**: TypeScript path aliases, FSD config
5. **Documentation**: README with FSD guidelines

## Steps

### 1. Ask User for Configuration

Before creating the structure, ask the user:

**Questions:**
1. **Project type**: New project or add to existing?
2. **Package manager**: npm, yarn, or pnpm?
3. **Include React Query**: Yes/No (recommended: Yes)
4. **Include TypeScript strict config**: Yes/No (recommended: Yes)
5. **Source directory**: `src` (default) or custom path?

### 2. Create Base FSD Structure

Create the following directory structure in the source directory (default: `src/`):

```
src/
├── app/
│   ├── providers/
│   │   └── .gitkeep
│   ├── styles/
│   │   └── .gitkeep
│   └── index.tsx
├── pages/
│   └── .gitkeep
├── widgets/
│   └── .gitkeep
├── features/
│   └── .gitkeep
├── entities/
│   └── .gitkeep
└── shared/
    ├── api/
    │   └── .gitkeep
    ├── ui/
    │   └── .gitkeep
    ├── lib/
    │   └── .gitkeep
    ├── config/
    │   └── .gitkeep
    └── types/
        └── .gitkeep
```

### 3. Create Shared API Infrastructure

#### File: `src/shared/api/client.ts`

Create a ky-based API client with hooks for authentication, logging, and error handling:

```typescript
import ky, { type KyInstance, type Options } from 'ky';

interface ApiClientConfig {
  prefixUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retry?: number;
}

class ApiClient {
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
          console.log(`[API] ${request.method} ${request.url}`);
        }],
        afterResponse: [async (request, options, response) => {
          console.log(`[API] Response from ${request.url}:`, response.status);
          
          if (!response.ok && response.status === 401) {
            // Handle unauthorized - redirect to login
            console.warn('[API] Unauthorized - redirecting to login');
            // window.location.href = '/login';
          }
          
          if (!response.ok) {
            console.error('[API] Response error:', response.status);
          }
          
          return response;
        }],
      },
    });
  }

  async get<T>(url: string, options?: Options): Promise<T> {
    return this.client.get(url, options).json<T>();
  }

  async post<T>(url: string, data?: unknown, options?: Options): Promise<T> {
    return this.client.post(url, { ...options, json: data }).json<T>();
  }

  async put<T>(url: string, data?: unknown, options?: Options): Promise<T> {
    return this.client.put(url, { ...options, json: data }).json<T>();
  }

  async patch<T>(url: string, data?: unknown, options?: Options): Promise<T> {
    return this.client.patch(url, { ...options, json: data }).json<T>();
  }

  async delete<T>(url: string, options?: Options): Promise<T> {
    return this.client.delete(url, options).json<T>();
  }

  async deleteNoContent(url: string, options?: Options): Promise<void> {
    await this.client.delete(url, options);
  }
}

export const apiClient = new ApiClient({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
});
```

#### File: `src/shared/api/index.ts`

```typescript
export { apiClient } from './client';
```

### 4. Create React Query Setup (if user selected Yes)

#### Install Dependencies

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
# or
yarn add @tanstack/react-query @tanstack/react-query-devtools
# or
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

#### File: `src/shared/api/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

#### File: `src/app/providers/QueryProvider.tsx`

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

### 5. Create App Entry Point

#### File: `src/app/index.tsx`

```typescript
import { QueryProvider } from './providers/QueryProvider';
// import './styles/global.css';

interface AppProps {
  children: React.ReactNode;
}

export function App({ children }: AppProps) {
  return (
    <QueryProvider>
      <div className="app">
        {children}
      </div>
    </QueryProvider>
  );
}
```

### 6. Configure TypeScript Path Aliases

Update `tsconfig.json` to include path aliases for FSD layers:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/app/*": ["src/app/*"],
      "@/pages/*": ["src/pages/*"],
      "@/widgets/*": ["src/widgets/*"],
      "@/features/*": ["src/features/*"],
      "@/entities/*": ["src/entities/*"],
      "@/shared/*": ["src/shared/*"]
    }
  }
}
```

If using Vite, also update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/widgets': path.resolve(__dirname, './src/widgets'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/entities': path.resolve(__dirname, './src/entities'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
});
```

### 7. Create FSD Configuration File

#### File: `.fsdrc.json` (project root)

```json
{
  "version": "1.0.0",
  "layers": ["app", "pages", "widgets", "features", "entities", "shared"],
  "segments": ["ui", "api", "model", "lib", "config"],
  "rules": {
    "publicApiRequired": true,
    "strictLayerDependencies": true,
    "allowCrossSliceImports": false
  }
}
```

### 8. Create Documentation

#### File: `FSD_GUIDE.md` (project root)

Create a quick reference guide for the team:

```markdown
# FSD Architecture Guide

## Layer Structure

### app (Level 6)
- Application initialization, routing, global providers
- Can import from: pages, widgets, features, entities, shared

### pages (Level 5)
- Full pages or nested routes
- Can import from: widgets, features, entities, shared

### widgets (Level 4)
- Large independent UI/feature blocks
- Can import from: features, entities, shared

### features (Level 3)
- Reusable business functionality
- Can import from: entities, shared

### entities (Level 2)
- Core domain elements (user, product, etc.)
- Can import from: shared only

### shared (Level 1)
- General utilities and components
- Cannot import from other layers

## Dependency Rule

```
app → pages → widgets → features → entities → shared
(Higher layers can only import from lower layers)
```

## Public API Pattern

Each slice must export through `index.ts`:

```typescript
// ✅ Good
import { User } from '@/entities/user';

// ❌ Bad
import { User } from '@/entities/user/model/types';
```

## Quick Commands

- Create new slice: `/fsd-slice`
- Validate structure: `/fsd-validate`
- Setup React Query: `/rq-setup`
```

### 9. Show Summary

After creating all files, show the user a summary:

```
✅ FSD structure initialized successfully!

Created:
- 6 FSD layers (app, pages, widgets, features, entities, shared)
- Shared API client (src/shared/api/client.ts)
- React Query setup (QueryClient + Provider)
- TypeScript path aliases configured
- FSD configuration (.fsdrc.json)
- Documentation (FSD_GUIDE.md)

Next steps:
1. Review and customize src/shared/api/client.ts
2. Set VITE_API_BASE_URL in your .env file
3. Create your first entity: /fsd-slice
4. Read FSD_GUIDE.md for team reference

Happy coding with FSD! 🚀
```

## Dependencies to Install

If React Query was selected, remind the user to install:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools ky
```

If TypeScript strict mode was selected, ensure `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Tips

1. **Existing projects**: If adding to an existing project, check for conflicts before creating files
2. **Customize**: Encourage users to customize the API client, error handling, and providers
3. **Team onboarding**: Share FSD_GUIDE.md with the team
4. **Linting**: Consider adding ESLint rules to enforce FSD patterns

## Common Follow-up Commands

After initialization, users typically want to:
- `/fsd-slice` - Create their first entity or feature
- `/rq-entity` - Generate React Query setup for an entity
- `/fsd-validate` - Validate the structure
