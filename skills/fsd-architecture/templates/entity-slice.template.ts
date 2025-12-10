// ============================================================================
// FSD Entity Slice Template with React Query Integration
// ============================================================================
// This template generates a complete entity slice structure following FSD
// architecture principles with integrated React Query patterns.
//
// Usage:
//   Replace {{entityName}} with camelCase name (e.g., user, product)
//   Replace {{EntityName}} with PascalCase name (e.g., User, Product)
//
// Generated structure:
//   entities/{{entityName}}/
//   ├── index.ts                    # Public API
//   ├── model/
//   │   ├── types.ts               # Domain types
//   │   └── index.ts
//   ├── api/
//   │   ├── {{entityName}}.queries.ts  # queryOptions factories
//   │   ├── {{entityName}}.keys.ts     # Query key factory
//   │   ├── {{entityName}}.api.ts      # API functions
//   │   └── index.ts
//   └── ui/
//       ├── {{EntityName}}Card.tsx     # Example UI component
//       └── index.ts
// ============================================================================

// ============================================================================
// File: entities/{{entityName}}/index.ts
// Public API - Only export what should be accessible from other layers
// ============================================================================
export type { {{EntityName}}, {{EntityName}}Dto } from './model';
export { {{entityName}}Queries, {{entityName}}Keys } from './api';
export { {{EntityName}}Card } from './ui';


// ============================================================================
// File: entities/{{entityName}}/model/types.ts
// Domain types and interfaces
// ============================================================================
/**
 * {{EntityName}} domain model
 * This represents the {{entityName}} entity in the application domain
 */
export interface {{EntityName}} {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // TODO: Add additional fields specific to {{entityName}}
}

/**
 * {{EntityName}} DTO (Data Transfer Object)
 * This represents the API response structure
 */
export interface {{EntityName}}Dto {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  // TODO: Add additional fields from API
}

/**
 * Filters for {{entityName}} list queries
 */
export interface {{EntityName}}Filters {
  search?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  // TODO: Add additional filter options
}


// ============================================================================
// File: entities/{{entityName}}/model/index.ts
// Model public exports
// ============================================================================
export type { {{EntityName}}, {{EntityName}}Dto, {{EntityName}}Filters } from './types';


// ============================================================================
// File: entities/{{entityName}}/api/{{entityName}}.keys.ts
// Query Key Factory Pattern
// Hierarchical query key management for React Query cache invalidation
// ============================================================================

export const {{entityName}}Keys = {
  /**
   * Base key for all {{entityName}} queries
   * Usage: queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.all })
   */
  all: ['{{entityName}}'] as const,

  /**
   * Key for all {{entityName}} list queries
   */
  lists: () => [...{{entityName}}Keys.all, 'list'] as const,

  /**
   * Key for a specific {{entityName}} list with filters
   * @param filters - Optional filters for the list
   */
  list: (filters?: Record<string, unknown>) =>
    [...{{entityName}}Keys.lists(), { filters }] as const,

  /**
   * Key for all {{entityName}} detail queries
   */
  details: () => [...{{entityName}}Keys.all, 'detail'] as const,

  /**
   * Key for a specific {{entityName}} detail by ID
   * @param id - {{EntityName}} ID
   */
  detail: (id: string) => [...{{entityName}}Keys.details(), id] as const,
};


// ============================================================================
// File: entities/{{entityName}}/api/{{entityName}}.api.ts
// API Functions - Pure functions for API calls
// ============================================================================

import { apiClient } from '@/shared/api';
import type { {{EntityName}}, {{EntityName}}Dto, {{EntityName}}Filters } from '../model';

/**
 * Transform DTO from API to domain model
 */
function mapDtoToDomain(dto: {{EntityName}}Dto): {{EntityName}} {
  return {
    id: dto.id.toString(),
    name: dto.name,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    // TODO: Map additional fields
  };
}

/**
 * Transform domain model to DTO for API
 */
function mapDomainToDto(domain: Partial<{{EntityName}}>): Partial<{{EntityName}}Dto> {
  return {
    name: domain.name,
    // TODO: Map additional fields
    // Note: Omit read-only fields like id, created_at, updated_at
  };
}

/**
 * {{EntityName}} API functions
 */
export const {{entityName}}Api = {
  /**
   * Get all {{entityName}}s
   * @param filters - Optional filters
   * @returns Promise<{{EntityName}}[]>
   */
  async getAll(filters?: {{EntityName}}Filters): Promise<{{EntityName}}[]> {
    const dtos = await apiClient.get<{{EntityName}}Dto[]>('api/{{entityName}}s', {
      searchParams: filters,
    });
    return dtos.map(mapDtoToDomain);
  },

  /**
   * Get {{entityName}} by ID
   * @param id - {{EntityName}} ID
   * @returns Promise<{{EntityName}}>
   */
  async getById(id: string): Promise<{{EntityName}}> {
    const dto = await apiClient.get<{{EntityName}}Dto>(`api/{{entityName}}s/${id}`);
    return mapDtoToDomain(dto);
  },

  /**
   * Create new {{entityName}}
   * @param data - {{EntityName}} data
   * @returns Promise<{{EntityName}}>
   */
  async create(data: Omit<{{EntityName}}, 'id' | 'createdAt' | 'updatedAt'>): Promise<{{EntityName}}> {
    const dto = mapDomainToDto(data);
    const response = await apiClient.post<{{EntityName}}Dto>('api/{{entityName}}s', dto);
    return mapDtoToDomain(response);
  },

  /**
   * Update {{entityName}}
   * @param id - {{EntityName}} ID
   * @param data - Partial {{EntityName}} data
   * @returns Promise<{{EntityName}}>
   */
  async update(id: string, data: Partial<{{EntityName}}>): Promise<{{EntityName}}> {
    const dto = mapDomainToDto(data);
    const response = await apiClient.patch<{{EntityName}}Dto>(`api/{{entityName}}s/${id}`, dto);
    return mapDtoToDomain(response);
  },

  /**
   * Delete {{entityName}}
   * @param id - {{EntityName}} ID
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    await apiClient.deleteNoContent(`api/{{entityName}}s/${id}`);
  },
};


// ============================================================================
// File: entities/{{entityName}}/api/{{entityName}}.queries.ts
// queryOptions Factory Pattern
// Reusable query configurations for React Query
// ============================================================================

import { queryOptions } from '@tanstack/react-query';
import { {{entityName}}Api } from './{{entityName}}.api';
import { {{entityName}}Keys } from './{{entityName}}.keys';
import type { {{EntityName}}Filters } from '../model';

/**
 * {{EntityName}} query factories using queryOptions pattern
 *
 * Benefits:
 * - Type-safe query configuration
 * - Reusable across components
 * - Easy to test
 * - Centralized query logic
 */
export const {{entityName}}Queries = {
  /**
   * Query for all {{entityName}}s
   * @param filters - Optional filters
   */
  all: (filters?: {{EntityName}}Filters) =>
    queryOptions({
      queryKey: {{entityName}}Keys.list(filters),
      queryFn: () => {{entityName}}Api.getAll(filters),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),

  /**
   * Query for a single {{entityName}} by ID
   * @param id - {{EntityName}} ID
   */
  detail: (id: string) =>
    queryOptions({
      queryKey: {{entityName}}Keys.detail(id),
      queryFn: () => {{entityName}}Api.getById(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
};


// ============================================================================
// File: entities/{{entityName}}/api/index.ts
// API public exports
// ============================================================================

export { {{entityName}}Queries } from './{{entityName}}.queries';
export { {{entityName}}Keys } from './{{entityName}}.keys';
export { {{entityName}}Api } from './{{entityName}}.api';


// ============================================================================
// File: entities/{{entityName}}/ui/{{EntityName}}Card.tsx
// Example UI component
// ============================================================================

import type { {{EntityName}} } from '../model';

interface {{EntityName}}CardProps {
  {{entityName}}: {{EntityName}};
  onClick?: ({{entityName}}: {{EntityName}}) => void;
}

/**
 * {{EntityName}}Card component
 * Displays {{entityName}} information in a card format
 */
export function {{EntityName}}Card({ {{entityName}}, onClick }: {{EntityName}}CardProps) {
  const handleClick = () => {
    onClick?.({{entityName}});
  };

  return (
    <div
      className="{{entityName}}-card"
      onClick={handleClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <h3>{{{entityName}}.name}</h3>
      <p>ID: {{{entityName}}.id}</p>
      <p>Created: {{{entityName}}.createdAt.toLocaleDateString()}</p>
      {/* TODO: Add more {{entityName}} details */}
    </div>
  );
}


// ============================================================================
// File: entities/{{entityName}}/ui/index.ts
// UI public exports
// ============================================================================

export { {{EntityName}}Card } from './{{EntityName}}Card';


// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Using in a component with useSuspenseQuery

import { useSuspenseQuery } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';

function {{EntityName}}Detail({ id }: { id: string }) {
  const { data: {{entityName}} } = useSuspenseQuery({{entityName}}Queries.detail(id));

  return (
    <div>
      <h1>{{{entityName}}.name}</h1>
      <p>Created: {{{entityName}}.createdAt.toLocaleDateString()}</p>
    </div>
  );
}

// Wrap with Suspense and ErrorBoundary
function {{EntityName}}DetailPage({ id }: { id: string }) {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSpinner />}>
        <{{EntityName}}Detail id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

// ============================================================================

// Example 2: Creating a custom hook (in features layer)

// features/{{entityName}}-profile/api/use{{EntityName}}Profile.ts
import { useSuspenseQuery } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';

export function use{{EntityName}}Profile(id: string) {
  return useSuspenseQuery({{entityName}}Queries.detail(id));
}

// ============================================================================

// Example 3: Using in a list

import { useSuspenseQuery } from '@tanstack/react-query';
import { {{entityName}}Queries, {{EntityName}}Card } from '@/entities/{{entityName}}';

function {{EntityName}}List() {
  const { data: {{entityName}}s } = useSuspenseQuery(
    {{entityName}}Queries.all({ sortBy: 'name', sortOrder: 'asc' })
  );

  return (
    <div className="{{entityName}}-list">
      {{{entityName}}s.map(({{entityName}}) => (
        <{{EntityName}}Card key={{{entityName}}.id} {{entityName}}={{{entityName}}} />
      ))}
    </div>
  );
}

// ============================================================================

// Example 4: Mutation (in features layer)

// features/edit-{{entityName}}/api/useUpdate{{EntityName}}.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { {{entityName}}Api, {{entityName}}Keys } from '@/entities/{{entityName}}';
import type { {{EntityName}} } from '@/entities/{{entityName}}';

export function useUpdate{{EntityName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: Partial<{{EntityName}}> }) =>
      {{entityName}}Api.update(params.id, params.data),

    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.detail(variables.id)
      });
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.lists()
      });

      // Or optimistic update
      // queryClient.setQueryData({{entityName}}Keys.detail(variables.id), data);
    },

    onError: (error) => {
      console.error('Failed to update {{entityName}}:', error);
      // Show toast notification
    },
  });
}

// ============================================================================

// Example 5: Cache invalidation

import { useQueryClient } from '@tanstack/react-query';
import { {{entityName}}Keys } from '@/entities/{{entityName}}';

function someFunction() {
  const queryClient = useQueryClient();

  // Invalidate all {{entityName}} queries
  queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.all });

  // Invalidate only lists
  queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.lists() });

  // Invalidate specific {{entityName}}
  queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.detail('123') });
}

*/
