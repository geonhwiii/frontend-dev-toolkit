// ============================================================================
// Query Options Factory Template
// ============================================================================
// This template generates queryOptions factories for type-safe, reusable
// React Query configurations.
//
// Usage:
//   Replace {{entityName}} with camelCase name (e.g., user, product)
//   Replace {{EntityName}} with PascalCase name (e.g., User, Product)
//
// Location: entities/{{entityName}}/api/{{entityName}}.queries.ts
// ============================================================================

import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import { {{entityName}}Api } from './{{entityName}}.api';
import { {{entityName}}Keys } from './{{entityName}}.keys';
import type { {{EntityName}}, {{EntityName}}Filters } from '../model';

/**
 * {{EntityName}} Query Options Factory
 *
 * Provides reusable query configurations using the queryOptions pattern.
 * Benefits:
 * - Type-safe query definitions
 * - Centralized configuration
 * - Easy to test
 * - Reusable across components
 *
 * @example
 * ```typescript
 * // In a component
 * const { data } = useSuspenseQuery({{entityName}}Queries.detail('123'));
 *
 * // In a prefetch
 * queryClient.prefetchQuery({{entityName}}Queries.all());
 * ```
 */
export const {{entityName}}Queries = {
  /**
   * Query for all {{entityName}}s with optional filters
   *
   * @param filters - Optional filters to apply
   * @returns Query options for fetching all {{entityName}}s
   *
   * @example
   * ```typescript
   * const { data: {{entityName}}s } = useSuspenseQuery(
   *   {{entityName}}Queries.all({ status: 'active' })
   * );
   * ```
   */
  all: (filters?: {{EntityName}}Filters) =>
    queryOptions({
      queryKey: {{entityName}}Keys.list(filters),
      queryFn: () => {{entityName}}Api.getAll(filters),
      staleTime: 1000 * 60 * 5, // 5 minutes - adjust based on data freshness needs
      gcTime: 1000 * 60 * 10, // 10 minutes - formerly cacheTime
      // retry: 1, // Retry failed requests once
      // refetchOnWindowFocus: false, // Don't refetch on window focus
    }),

  /**
   * Query for a single {{entityName}} by ID
   *
   * @param id - {{EntityName}} ID
   * @returns Query options for fetching {{entityName}} detail
   *
   * @example
   * ```typescript
   * const { data: {{entityName}} } = useSuspenseQuery(
   *   {{entityName}}Queries.detail('123')
   * );
   * ```
   */
  detail: (id: string) =>
    queryOptions({
      queryKey: {{entityName}}Keys.detail(id),
      queryFn: () => {{entityName}}Api.getById(id),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      // enabled: !!id, // Only run query if ID exists
    }),

  // TODO: Add additional query patterns as needed
  // Examples below:

  /**
   * Infinite query for paginated {{entityName}} lists
   *
   * @param filters - Optional filters
   * @returns Infinite query options
   *
   * @example
   * ```typescript
   * const {
   *   data,
   *   fetchNextPage,
   *   hasNextPage,
   * } = useInfiniteQuery({{entityName}}Queries.infinite());
   * ```
   */
  // infinite: (filters?: {{EntityName}}Filters) =>
  //   infiniteQueryOptions({
  //     queryKey: {{entityName}}Keys.infinite(filters),
  //     queryFn: ({ pageParam }) =>
  //       {{entityName}}Api.getAll({ ...filters, page: pageParam }),
  //     initialPageParam: 1,
  //     getNextPageParam: (lastPage, allPages) => {
  //       return lastPage.hasMore ? allPages.length + 1 : undefined;
  //     },
  //     getPreviousPageParam: (firstPage, allPages) => {
  //       return allPages.length > 1 ? allPages.length - 1 : undefined;
  //     },
  //     staleTime: 1000 * 60 * 5,
  //   }),

  /**
   * Query for {{entityName}} search
   *
   * @param query - Search query string
   * @returns Query options for search
   */
  // search: (query: string) =>
  //   queryOptions({
  //     queryKey: {{entityName}}Keys.search(query),
  //     queryFn: () => {{entityName}}Api.search(query),
  //     enabled: query.length >= 3, // Only search with 3+ characters
  //     staleTime: 1000 * 60 * 2, // Search results stale faster
  //   }),
};

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Type helper to extract query data type
 */
export type {{EntityName}}QueryData = Awaited<
  ReturnType<ReturnType<typeof {{entityName}}Queries.detail>['queryFn']>
>;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Basic usage with useSuspenseQuery

import { useSuspenseQuery } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';

function {{EntityName}}Detail({ id }: { id: string }) {
  const { data: {{entityName}} } = useSuspenseQuery({{entityName}}Queries.detail(id));

  return (
    <div>
      <h1>{{{entityName}}.name}</h1>
      <p>{{{entityName}}.description}</p>
    </div>
  );
}

// Wrap with Suspense + ErrorBoundary
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

// Example 2: Using with useQuery (with loading states)

import { useQuery } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';

function {{EntityName}}List() {
  const { data: {{entityName}}s, isLoading, error } = useQuery(
    {{entityName}}Queries.all({ status: 'active' })
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!{{entityName}}s) return null;

  return (
    <div>
      {{{entityName}}s.map(({{entityName}}) => (
        <{{EntityName}}Card key={ {{entityName}}.id} {{entityName}}={ {{entityName}}} />
      ))}
    </div>
  );
}

// ============================================================================

// Example 3: Prefetching

import { useQueryClient } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';

function {{EntityName}}ListWithPrefetch() {
  const queryClient = useQueryClient();
  const { data: {{entityName}}s } = useSuspenseQuery({{entityName}}Queries.all());

  const handleMouseEnter = (id: string) => {
    // Prefetch detail on hover for better UX
    queryClient.prefetchQuery({{entityName}}Queries.detail(id));
  };

  return (
    <div>
      {{{entityName}}s.map(({{entityName}}) => (
        <div
          key={ {{entityName}}.id}
          onMouseEnter={() => handleMouseEnter({{entityName}}.id)}
        >
          {{{entityName}}.name}
        </div>
      ))}
    </div>
  );
}

// ============================================================================

// Example 4: Dependent queries

function {{EntityName}}WithRelatedData({ id }: { id: string }) {
  // First query
  const { data: {{entityName}} } = useSuspenseQuery({{entityName}}Queries.detail(id));

  // Second query that depends on first
  const { data: orders } = useSuspenseQuery(
    orderQueries.by{{EntityName}}({{entityName}}.id)
  );

  return (
    <div>
      <{{EntityName}}Card {{entityName}}={ {{entityName}}} />
      <OrderList orders={orders} />
    </div>
  );
}

// ============================================================================

// Example 5: Conditional query

function {{EntityName}}Conditional({ id }: { id?: string }) {
  const { data: {{entityName}}, isLoading } = useQuery({
    ...{{entityName}}Queries.detail(id!),
    enabled: !!id, // Only run query if ID exists
  });

  if (!id) return <div>No ID provided</div>;
  if (isLoading) return <LoadingSpinner />;
  if (!{{entityName}}) return null;

  return <{{EntityName}}Card {{entityName}}={ {{entityName}}} />;
}

// ============================================================================

// Example 6: Custom hook wrapping query

// features/{{entityName}}-profile/api/use{{EntityName}}Profile.ts
import { useSuspenseQuery } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';

export function use{{EntityName}}Profile(id: string) {
  return useSuspenseQuery({{entityName}}Queries.detail(id));
}

// Usage in component
function {{EntityName}}ProfilePage({ id }: { id: string }) {
  const { data: {{entityName}} } = use{{EntityName}}Profile(id);
  return <div>{{{entityName}}.name}</div>;
}

// ============================================================================

// Example 7: Multiple queries in parallel

function {{EntityName}}Dashboard() {
  const [
    { data: active{{EntityName}}s },
    { data: inactive{{EntityName}}s },
    { data: stats },
  ] = useSuspenseQueries({
    queries: [
      {{entityName}}Queries.all({ status: 'active' }),
      {{entityName}}Queries.all({ status: 'inactive' }),
      {{entityName}}Queries.stats(),
    ],
  });

  return (
    <div>
      <StatsPanel stats={stats} />
      <{{EntityName}}List title="Active" {{entityName}}s={active{{EntityName}}s} />
      <{{EntityName}}List title="Inactive" {{entityName}}s={inactive{{EntityName}}s} />
    </div>
  );
}

// ============================================================================

// Example 8: Query with select transformation

function {{EntityName}}Names() {
  const { data: names } = useQuery({
    ...{{entityName}}Queries.all(),
    select: ({{entityName}}s) => {{entityName}}s.map((u) => u.name),
  });

  return (
    <ul>
      {names?.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}

*/

// ============================================================================
// ADVANCED PATTERNS
// ============================================================================

/*
// Pattern 1: Query with placeholderData

export const {{entityName}}Queries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: {{entityName}}Keys.detail(id),
      queryFn: () => {{entityName}}Api.getById(id),
      placeholderData: (previousData) => previousData, // Keep previous data while fetching
    }),
};

// ============================================================================

// Pattern 2: Query with retry logic

export const {{entityName}}Queries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: {{entityName}}Keys.detail(id),
      queryFn: () => {{entityName}}Api.getById(id),
      retry: (failureCount, error) => {
        // Don't retry on 404
        if (error.response?.status === 404) return false;
        // Retry up to 3 times
        return failureCount < 3;
      },
    }),
};

// ============================================================================

// Pattern 3: Query with custom cache time based on data

export const {{entityName}}Queries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: {{entityName}}Keys.detail(id),
      queryFn: () => {{entityName}}Api.getById(id),
      staleTime: (query) => {
        const data = query.state.data;
        // Fresh data stays fresh longer
        return data?.isFresh ? 1000 * 60 * 10 : 1000 * 60 * 2;
      },
    }),
};

*/

