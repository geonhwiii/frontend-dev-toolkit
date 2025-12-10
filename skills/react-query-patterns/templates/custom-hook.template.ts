// ============================================================================
// Custom Hook Template (useSuspenseQuery wrapper)
// ============================================================================
// This template generates custom hooks that wrap useSuspenseQuery with
// entity queries for semantic, reusable data fetching.
//
// Usage:
//   Replace {{entityName}} with camelCase name (e.g., user, product)
//   Replace {{EntityName}} with PascalCase name (e.g., User, Product)
//   Replace {{featureName}} with feature context (e.g., userProfile, productDetail)
//   Replace {{FeatureName}} with PascalCase feature name (e.g., UserProfile, ProductDetail)
//
// Location: features/{{featureName}}/api/use{{FeatureName}}.ts
// ============================================================================

import { useSuspenseQuery, useSuspenseQueries } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';
import type { {{EntityName}} } from '@/entities/{{entityName}}';

/**
 * Custom hook for fetching {{entityName}} with Suspense support
 *
 * This hook wraps useSuspenseQuery to provide a semantic API for
 * fetching {{entityName}} data. Use with Suspense and ErrorBoundary.
 *
 * @param id - {{EntityName}} ID
 * @returns Query result with {{entityName}} data
 *
 * @example
 * ```typescript
 * function {{FeatureName}}() {
 *   const { data: {{entityName}} } = use{{FeatureName}}('123');
 *   return <div>{{{entityName}}.name}</div>;
 * }
 *
 * // Wrap with Suspense + ErrorBoundary
 * function {{FeatureName}}Page({ id }: { id: string }) {
 *   return (
 *     <ErrorBoundary fallback={<ErrorFallback />}>
 *       <Suspense fallback={<LoadingSpinner />}>
 *         <{{FeatureName}} id={id} />
 *       </Suspense>
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 */
export function use{{FeatureName}}(id: string) {
  return useSuspenseQuery({{entityName}}Queries.detail(id));
}

/**
 * Custom hook for fetching multiple {{entityName}}s with Suspense support
 *
 * @param filters - Optional filters for the list
 * @returns Query result with {{entityName}}s array
 *
 * @example
 * ```typescript
 * function {{FeatureName}}List() {
 *   const { data: {{entityName}}s } = use{{FeatureName}}List({ status: 'active' });
 *   return (
 *     <div>
 *       {{{entityName}}s.map(({{entityName}}) => (
 *         <{{EntityName}}Card key={ {{entityName}}.id} {{entityName}}={ {{entityName}}} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function use{{FeatureName}}List(filters?: {{EntityName}}Filters) {
  return useSuspenseQuery({{entityName}}Queries.all(filters));
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Basic usage in component

import { use{{FeatureName}} } from '@/features/{{featureName}}';

function {{FeatureName}}Content({ id }: { id: string }) {
  const { data: {{entityName}} } = use{{FeatureName}}(id);

  return (
    <div>
      <h1>{{{entityName}}.name}</h1>
      <p>{{{entityName}}.description}</p>
    </div>
  );
}

// Wrap with Suspense boundary
function {{FeatureName}}Page({ id }: { id: string }) {
  return (
    <ErrorBoundary fallback={<div>Error loading {{entityName}}</div>}>
      <Suspense fallback={<div>Loading {{entityName}}...</div>}>
        <{{FeatureName}}Content id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

// ============================================================================

// Example 2: With refetch capability

import { use{{FeatureName}} } from '@/features/{{featureName}}';

function {{FeatureName}}WithRefetch({ id }: { id: string }) {
  const { data: {{entityName}}, refetch } = use{{FeatureName}}(id);

  return (
    <div>
      <{{EntityName}}Card {{entityName}}={ {{entityName}}} />
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

// ============================================================================

// Example 3: Multiple queries in parallel

import { use{{FeatureName}} } from '@/features/{{featureName}}';
import { useOtherData } from '@/features/other';

function Combined{{FeatureName}}() {
  const { data: {{entityName}} } = use{{FeatureName}}('123');
  const { data: otherData } = useOtherData('456');

  return (
    <div>
      <{{EntityName}}Card {{entityName}}={ {{entityName}}} />
      <OtherCard data={otherData} />
    </div>
  );
}

// Both queries run in parallel, Suspense waits for both

// ============================================================================

// Example 4: With dependent data

function {{FeatureName}}WithOrders({ id }: { id: string }) {
  // First query
  const { data: {{entityName}} } = use{{FeatureName}}(id);

  // Second query depends on first
  const { data: orders } = useOrders({{entityName}}.id);

  return (
    <div>
      <{{EntityName}}Card {{entityName}}={ {{entityName}}} />
      <OrderList orders={orders} />
    </div>
  );
}

// ============================================================================

// Example 5: With error handling

function {{FeatureName}}WithErrorBoundary({ id }: { id: string }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div>
          <h2>Failed to load {{entityName}}</h2>
          <p>{error.message}</p>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
      )}
    >
      <Suspense fallback={<{{EntityName}}Skeleton />}>
        <{{FeatureName}}Content id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}

function {{FeatureName}}Content({ id }: { id: string }) {
  const { data: {{entityName}} } = use{{FeatureName}}(id);
  return <{{EntityName}}Card {{entityName}}={ {{entityName}}} />;
}

// ============================================================================

// Example 6: List with filters

import { useState } from 'react';
import { use{{FeatureName}}List } from '@/features/{{featureName}}';

function {{FeatureName}}FilterableList() {
  const [filters, setFilters] = useState({ status: 'active' });

  return (
    <div>
      <FilterBar onFilterChange={setFilters} />
      <ErrorBoundary fallback={<div>Error loading list</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <{{FeatureName}}ListContent filters={filters} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function {{FeatureName}}ListContent({ filters }) {
  const { data: {{entityName}}s } = use{{FeatureName}}List(filters);

  return (
    <div>
      {{{entityName}}s.map(({{entityName}}) => (
        <{{EntityName}}Card key={ {{entityName}}.id} {{entityName}}={ {{entityName}}} />
      ))}
    </div>
  );
}

*/

// ============================================================================
// ADVANCED PATTERNS
// ============================================================================

/*
// Pattern 1: Hook with prefetching

import { useQueryClient } from '@tanstack/react-query';
import { {{entityName}}Queries } from '@/entities/{{entityName}}';

export function use{{FeatureName}}WithPrefetch(id: string) {
  const queryClient = useQueryClient();
  const result = useSuspenseQuery({{entityName}}Queries.detail(id));

  // Prefetch related data
  React.useEffect(() => {
    if (result.data) {
      queryClient.prefetchQuery(relatedQueries.byId(result.data.relatedId));
    }
  }, [result.data, queryClient]);

  return result;
}

// ============================================================================

// Pattern 2: Hook with transformation

export function use{{FeatureName}}Names() {
  const result = useSuspenseQuery({
    ...{{entityName}}Queries.all(),
    select: ({{entityName}}s) => {{entityName}}s.map((u) => u.name),
  });

  return result;
}

// ============================================================================

// Pattern 3: Hook with multiple related queries

export function use{{FeatureName}}Complete(id: string) {
  const [{{entityName}}Result, ordersResult, settingsResult] = useSuspenseQueries({
    queries: [
      {{entityName}}Queries.detail(id),
      orderQueries.by{{EntityName}}(id),
      settingsQueries.by{{EntityName}}(id),
    ],
  });

  return {
    {{entityName}}: {{entityName}}Result.data,
    orders: ordersResult.data,
    settings: settingsResult.data,
  };
}

// Usage:
function {{FeatureName}}Complete({ id }) {
  const { {{entityName}}, orders, settings } = use{{FeatureName}}Complete(id);

  return (
    <div>
      <{{EntityName}}Card {{entityName}}={ {{entityName}}} />
      <OrderList orders={orders} />
      <Settings settings={settings} />
    </div>
  );
}

// ============================================================================

// Pattern 4: Hook with polling

export function use{{FeatureName}}WithPolling(id: string, interval = 5000) {
  return useSuspenseQuery({
    ...{{entityName}}Queries.detail(id),
    refetchInterval: interval,
  });
}

// ============================================================================

// Pattern 5: Hook with conditional fetching

export function use{{FeatureName}}Conditional(id?: string) {
  return useQuery({
    ...{{entityName}}Queries.detail(id!),
    enabled: !!id,
  });
}

// Note: This uses useQuery instead of useSuspenseQuery because
// we need conditional fetching which doesn't work well with Suspense

*/

