---
description: Generate React Query setup for an entity including queryOptions, queryKeyFactory, API functions, and types
---

# React Query Entity Command

Entity에 완전한 React Query 구조를 생성합니다. FSD 아키텍처의 entities 레이어에 queries, keys, API 함수를 자동으로 생성합니다.

## 이 커맨드가 하는 일

1. **Query Key Factory**: 계층적 쿼리 키 관리
2. **Query Options Factory**: 재사용 가능한 queryOptions
3. **API Functions**: CRUD 작업을 위한 API 함수
4. **Type Definitions**: Entity 도메인 타입과 DTO
5. **Public API**: index.ts를 통한 export

## 실행 단계

### 1. 사용자에게 확인

**질문 1: Entity 이름**
- "Entity 이름을 입력하세요 (예: user, product, order)"
- 형식: camelCase 단수형
- 예시: user, product, order, comment

**질문 2: 기본 필드**
- "Entity의 주요 필드를 입력하세요 (쉼표로 구분)"
- 형식: name:type, name:type
- 예시: name:string, email:string, age:number, isActive:boolean
- 기본값: id:string, name:string, createdAt:Date

**질문 3: API 엔드포인트**
- "API 엔드포인트를 입력하세요"
- 형식: /api/resource
- 예시: /api/users, /api/v1/products
- 기본값: /api/{entityName}s

**질문 4: 필터 옵션**
- "검색/필터 기능이 필요한가요?"
- 옵션: Yes (권장), No
- Yes인 경우 필터 필드 추가 질문

### 2. 디렉토리 구조 생성

Entity 디렉토리를 생성합니다:

```
entities/{{entityName}}/
├── model/
│   ├── types.ts
│   └── index.ts
├── api/
│   ├── {{entityName}}.queries.ts
│   ├── {{entityName}}.keys.ts
│   ├── {{entityName}}.api.ts
│   └── index.ts
└── index.ts
```

### 3. 파일 생성

#### 파일 1: `model/types.ts`

```typescript
/**
 * {{EntityName}} domain model
 */
export interface {{EntityName}} {
  id: string;
  {{#each fields}}
  {{this.name}}: {{this.type}};
  {{/each}}
  createdAt: Date;
  updatedAt: Date;
}

/**
 * {{EntityName}} DTO from API
 */
export interface {{EntityName}}Dto {
  id: number;
  {{#each fields}}
  {{this.snakeName}}: {{this.dtoType}};
  {{/each}}
  created_at: string;
  updated_at: string;
}

{{#if includeFilters}}
/**
 * Filters for {{entityName}} queries
 */
export interface {{EntityName}}Filters {
  search?: string;
  {{#each filterFields}}
  {{this.name}}?: {{this.type}};
  {{/each}}
  sortBy?: {{sortByOptions}};
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
{{/if}}
```

#### 파일 2: `api/{{entityName}}.keys.ts`

```typescript
{{#if includeFilters}}
import type { {{EntityName}}Filters } from '../model';
{{/if}}

/**
 * {{EntityName}} Query Key Factory
 * 
 * Hierarchical structure for cache management:
 * - {{entityName}}Keys.all: All {{entityName}} queries
 * - {{entityName}}Keys.lists(): All list queries
 * - {{entityName}}Keys.details(): All detail queries
 * - {{entityName}}Keys.detail(id): Specific {{entityName}}
 */
export const {{entityName}}Keys = {
  all: ['{{entityName}}'] as const,
  
  lists: () => [...{{entityName}}Keys.all, 'list'] as const,
  
  list: (filters?: {{#if includeFilters}}{{EntityName}}Filters{{else}}Record<string, unknown>{{/if}}) =>
    [...{{entityName}}Keys.lists(), { filters }] as const,
  
  details: () => [...{{entityName}}Keys.all, 'detail'] as const,
  
  detail: (id: string) => [...{{entityName}}Keys.details(), id] as const,
};
```

#### 파일 3: `api/{{entityName}}.api.ts`

```typescript
import { apiClient } from '@/shared/api';
import type { {{EntityName}}, {{EntityName}}Dto{{#if includeFilters}}, {{EntityName}}Filters{{/if}} } from '../model';

/**
 * Transform DTO to domain model
 */
function mapDtoToDomain(dto: {{EntityName}}Dto): {{EntityName}} {
  return {
    id: dto.id.toString(),
    {{#each fields}}
    {{this.name}}: dto.{{this.snakeName}},
    {{/each}}
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

/**
 * Transform domain model to DTO
 */
function mapDomainToDto(domain: Partial<{{EntityName}}>): Partial<{{EntityName}}Dto> {
  return {
    {{#each fields}}
    {{#if this.editable}}
    {{this.snakeName}}: domain.{{this.name}},
    {{/if}}
    {{/each}}
  };
}

/**
 * {{EntityName}} API functions
 */
export const {{entityName}}Api = {
  /**
   * Get all {{entityName}}s
   */
  async getAll(filters?: {{#if includeFilters}}{{EntityName}}Filters{{else}}Record<string, unknown>{{/if}}): Promise<{{EntityName}}[]> {
    const response = await apiClient.get<{{EntityName}}Dto[]>('{{apiEndpoint}}', {
      params: filters,
    });
    return response.data.map(mapDtoToDomain);
  },

  /**
   * Get {{entityName}} by ID
   */
  async getById(id: string): Promise<{{EntityName}}> {
    const response = await apiClient.get<{{EntityName}}Dto>(`{{apiEndpoint}}/${id}`);
    return mapDtoToDomain(response.data);
  },

  /**
   * Create new {{entityName}}
   */
  async create(data: Omit<{{EntityName}}, 'id' | 'createdAt' | 'updatedAt'>): Promise<{{EntityName}}> {
    const dto = mapDomainToDto(data);
    const response = await apiClient.post<{{EntityName}}Dto>('{{apiEndpoint}}', dto);
    return mapDtoToDomain(response.data);
  },

  /**
   * Update {{entityName}}
   */
  async update(id: string, data: Partial<{{EntityName}}>): Promise<{{EntityName}}> {
    const dto = mapDomainToDto(data);
    const response = await apiClient.patch<{{EntityName}}Dto>(`{{apiEndpoint}}/${id}`, dto);
    return mapDtoToDomain(response.data);
  },

  /**
   * Delete {{entityName}}
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`{{apiEndpoint}}/${id}`);
  },
};
```

#### 파일 4: `api/{{entityName}}.queries.ts`

```typescript
import { queryOptions } from '@tanstack/react-query';
import { {{entityName}}Api } from './{{entityName}}.api';
import { {{entityName}}Keys } from './{{entityName}}.keys';
{{#if includeFilters}}
import type { {{EntityName}}Filters } from '../model';
{{/if}}

/**
 * {{EntityName}} Query Options Factory
 * 
 * Provides reusable query configurations with proper type safety
 */
export const {{entityName}}Queries = {
  /**
   * Query for all {{entityName}}s
   */
  all: (filters?: {{#if includeFilters}}{{EntityName}}Filters{{else}}Record<string, unknown>{{/if}}) =>
    queryOptions({
      queryKey: {{entityName}}Keys.list(filters),
      queryFn: () => {{entityName}}Api.getAll(filters),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  /**
   * Query for single {{entityName}} by ID
   */
  detail: (id: string) =>
    queryOptions({
      queryKey: {{entityName}}Keys.detail(id),
      queryFn: () => {{entityName}}Api.getById(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
};
```

#### 파일 5: `api/index.ts`

```typescript
export { {{entityName}}Queries } from './{{entityName}}.queries';
export { {{entityName}}Keys } from './{{entityName}}.keys';
export { {{entityName}}Api } from './{{entityName}}.api';
```

#### 파일 6: `model/index.ts`

```typescript
export type { {{EntityName}}, {{EntityName}}Dto{{#if includeFilters}}, {{EntityName}}Filters{{/if}} } from './types';
```

#### 파일 7: `index.ts` (Public API)

```typescript
export type { {{EntityName}}{{#if includeFilters}}, {{EntityName}}Filters{{/if}} } from './model';
export { {{entityName}}Queries, {{entityName}}Keys, {{entityName}}Api } from './api';
```

### 4. 사용 예시 파일 생성 (선택)

README.md 또는 USAGE.md 생성:

```markdown
# {{EntityName}} Entity

## Usage

### Query {{entityName}}s

\`\`\`typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';

function {{EntityName}}List() {
  const { data: {{entityName}}s } = useSuspenseQuery(
    {{entityName}}Queries.all({{#if includeFilters}}{ search: 'keyword' }{{/if}})
  );

  return (
    <div>
      {{{entityName}}s.map(({{entityName}}) => (
        <div key={ {{entityName}}.id}>{{{entityName}}.name}</div>
      ))}
    </div>
  );
}
\`\`\`

### Query single {{entityName}}

\`\`\`typescript
function {{EntityName}}Detail({ id }: { id: string }) {
  const { data: {{entityName}} } = useSuspenseQuery({{entityName}}Queries.detail(id));
  return <div>{{{entityName}}.name}</div>;
}
\`\`\`

### Cache invalidation

\`\`\`typescript
import { useQueryClient } from '@tanstack/react-query';
import { {{entityName}}Keys } from '@/entities/{{entityName}}';

function MyComponent() {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.all });
  };

  return <button onClick={refresh}>Refresh</button>;
}
\`\`\`
```

### 5. 요약 출력

```
✅ {{EntityName}} Entity 생성 완료!

위치: entities/{{entityName}}/

생성된 파일:
- model/types.ts                    # {{EntityName}}, {{EntityName}}Dto{{#if includeFilters}}, {{EntityName}}Filters{{/if}}
- api/{{entityName}}.keys.ts        # Query key factory
- api/{{entityName}}.queries.ts     # queryOptions factory
- api/{{entityName}}.api.ts         # API functions (CRUD)
- index.ts                          # Public API

주요 Export:
- {{EntityName}} (타입)
- {{entityName}}Queries (쿼리 팩토리)
- {{entityName}}Keys (키 팩토리)
- {{entityName}}Api (API 함수)

다음 단계:
1. API 엔드포인트 확인: {{apiEndpoint}}
2. .env 파일에 VITE_API_BASE_URL 설정
3. 컴포넌트에서 사용:
   \`\`\`typescript
   import { useSuspenseQuery } from '@tanstack/react-query';
   import { {{entityName}}Queries } from '@/entities/{{entityName}}';
   
   const { data: {{entityName}}s } = useSuspenseQuery({{entityName}}Queries.all());
   \`\`\`

4. Feature 생성: /fsd-slice (mutation용)
```

## 예시

### 예시 1: User Entity

```
사용자: /rq-entity

질문 1: Entity 이름?
답변: user

질문 2: 주요 필드? (쉼표로 구분)
답변: name:string, email:string, age:number, role:string

질문 3: API 엔드포인트?
답변: /api/users

질문 4: 필터 기능?
답변: y

→ entities/user/ 구조 생성
→ User, UserDto, UserFilters 타입 생성
→ userQueries, userKeys, userApi 생성
```

### 예시 2: Product Entity

```
사용자: /rq-entity

답변: product, title:string, price:number, stock:number, /api/v1/products, y

결과:
- entities/product/ 생성
- Product 타입에 title, price, stock 필드 포함
- productQueries, productKeys, productApi 생성
- 필터 기능 포함
```

## 검증

생성 후 다음 사항을 확인합니다:

1. **타입 정의 확인**
   ```typescript
   import type { {{EntityName}} } from '@/entities/{{entityName}}';
   ```

2. **쿼리 사용 가능 확인**
   ```typescript
   import { {{entityName}}Queries } from '@/entities/{{entityName}}';
   const query = {{entityName}}Queries.all();
   ```

3. **Public API 확인**
   - index.ts를 통해서만 import 가능한지 확인

## 트러블슈팅

### 문제: "Cannot find module '@/entities/{{entityName}}'"

**해결책**: tsconfig.json의 path alias 확인

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 문제: "apiClient is not defined"

**해결책**: shared/api/client.ts 생성 필요

```bash
/rq-setup  # React Query 설정 먼저 실행
```

### 문제: 타입 에러 발생

**해결책**: 
1. model/types.ts의 필드 타입 확인
2. DTO 변환 함수 확인
3. 실제 API 응답 구조와 맞는지 확인

## 후속 작업

Entity 생성 후:

1. **UI 컴포넌트 추가**: entities/{{entityName}}/ui/
2. **Feature 생성**: features/edit-{{entityName}}, features/delete-{{entityName}}
3. **Mutation 추가**: useCreate{{EntityName}}, useUpdate{{EntityName}}
4. **테스트**: 쿼리가 정상 작동하는지 확인

## 고급 옵션

### Infinite Query 추가

```typescript
// api/{{entityName}}.queries.ts에 추가
import { infiniteQueryOptions } from '@tanstack/react-query';

export const {{entityName}}Queries = {
  // ... 기존 쿼리들
  
  infinite: (filters?: {{EntityName}}Filters) =>
    infiniteQueryOptions({
      queryKey: {{entityName}}Keys.infinite(filters),
      queryFn: ({ pageParam = 1 }) =>
        {{entityName}}Api.getAll({ ...filters, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.hasMore ? allPages.length + 1 : undefined;
      },
    }),
};
```

### 추가 Query Keys

```typescript
// api/{{entityName}}.keys.ts에 추가
export const {{entityName}}Keys = {
  // ... 기존 키들
  
  search: (query: string) =>
    [...{{entityName}}Keys.all, 'search', query] as const,
  
  byStatus: (status: string) =>
    [...{{entityName}}Keys.all, 'by-status', status] as const,
};
```

