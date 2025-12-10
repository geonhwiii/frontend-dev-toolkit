// ============================================================================
// Query Key Factory Template
// ============================================================================
// This template generates a hierarchical query key factory for React Query
// cache management following best practices.
//
// Usage:
//   Replace {{entityName}} with camelCase name (e.g., user, product)
//   Replace {{EntityName}} with PascalCase name (e.g., User, Product)
//
// Location: entities/{{entityName}}/api/{{entityName}}.keys.ts
// ============================================================================

/**
 * {{EntityName}} Query Key Factory
 *
 * Hierarchical query key structure for granular cache invalidation:
 * - {{entityName}}Keys.all: Invalidate all {{entityName}} queries
 * - {{entityName}}Keys.lists(): Invalidate all list queries
 * - {{entityName}}Keys.details(): Invalidate all detail queries
 * - {{entityName}}Keys.detail(id): Invalidate specific {{entityName}}
 *
 * @example
 * ```typescript
 * // Invalidate all {{entityName}} queries
 * queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.all });
 *
 * // Invalidate all {{entityName}} lists
 * queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.lists() });
 *
 * // Invalidate specific {{entityName}}
 * queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.detail('123') });
 * ```
 */
export const {{entityName}}Keys = {
  /**
   * Base key for all {{entityName}} queries
   * Use this to invalidate everything related to {{entityName}}
   */
  all: ['{{entityName}}'] as const,

  /**
   * Key for all {{entityName}} list queries (without filters)
   */
  lists: () => [...{{entityName}}Keys.all, 'list'] as const,

  /**
   * Key for a specific {{entityName}} list with filters
   * @param filters - Optional filter parameters
   *
   * @example
   * ```typescript
   * {{entityName}}Keys.list({ status: 'active', search: 'john' })
   * // Result: ['{{entityName}}', 'list', { filters: { status: 'active', search: 'john' } }]
   * ```
   */
  list: (filters?: Record<string, unknown>) =>
    [...{{entityName}}Keys.lists(), { filters }] as const,

  /**
   * Key for all {{entityName}} detail queries (without IDs)
   */
  details: () => [...{{entityName}}Keys.all, 'detail'] as const,

  /**
   * Key for a specific {{entityName}} detail by ID
   * @param id - {{EntityName}} ID
   *
   * @example
   * ```typescript
   * {{entityName}}Keys.detail('123')
   * // Result: ['{{entityName}}', 'detail', '123']
   * ```
   */
  detail: (id: string) => [...{{entityName}}Keys.details(), id] as const,

  // TODO: Add additional query key patterns if needed
  // Examples:

  /**
   * Key for {{entityName}} search queries
   * @param query - Search query string
   */
  // search: (query: string) =>
  //   [...{{entityName}}Keys.all, 'search', query] as const,

  /**
   * Key for {{entityName}} by specific field
   * @param field - Field name
   * @param value - Field value
   */
  // byField: (field: string, value: string) =>
  //   [...{{entityName}}Keys.all, 'by', field, value] as const,

  /**
   * Key for infinite query
   * @param filters - Optional filter parameters
   */
  // infinite: (filters?: Record<string, unknown>) =>
  //   [...{{entityName}}Keys.all, 'infinite', { filters }] as const,
};

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Type helper for {{entityName}} query keys
 * Useful for type-safe cache manipulation
 */
export type {{EntityName}}QueryKey = ReturnType<
  typeof {{entityName}}Keys[keyof typeof {{entityName}}Keys]
>;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Basic cache invalidation

import { useQueryClient } from '@tanstack/react-query';
import { {{entityName}}Keys } from '@/entities/{{entityName}}';

function MyComponent() {
  const queryClient = useQueryClient();

  const handleInvalidate = () => {
    // Invalidate all {{entityName}} queries
    queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.all });
  };

  return <button onClick={handleInvalidate}>Refresh</button>;
}

// ============================================================================

// Example 2: Granular invalidation

function useUpdate{{EntityName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: {{entityName}}Api.update,
    onSuccess: (data, variables) => {
      // Invalidate only the specific {{entityName}}
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.detail(variables.id)
      });

      // Also invalidate lists to show updated data
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.lists()
      });
    },
  });
}

// ============================================================================

// Example 3: Optimistic update with rollback

function useDelete{{EntityName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: {{entityName}}Api.delete,

    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: {{entityName}}Keys.detail(id)
      });

      // Snapshot previous value
      const previous{{EntityName}} = queryClient.getQueryData(
        {{entityName}}Keys.detail(id)
      );

      // Optimistically remove from cache
      queryClient.removeQueries({
        queryKey: {{entityName}}Keys.detail(id)
      });

      return { previous{{EntityName}} };
    },

    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previous{{EntityName}}) {
        queryClient.setQueryData(
          {{entityName}}Keys.detail(id),
          context.previous{{EntityName}}
        );
      }
    },

    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.all
      });
    },
  });
}

// ============================================================================

// Example 4: Prefetching with query keys

function {{EntityName}}List() {
  const queryClient = useQueryClient();

  const handleMouseEnter = (id: string) => {
    // Prefetch detail on hover
    queryClient.prefetchQuery({
      queryKey: {{entityName}}Keys.detail(id),
      queryFn: () => {{entityName}}Api.getById(id),
    });
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

// Example 5: Manual cache manipulation

function useManualCacheUpdate() {
  const queryClient = useQueryClient();

  const updateCache = (id: string, updates: Partial<{{EntityName}}>) => {
    // Update specific {{entityName}} in cache
    queryClient.setQueryData(
      {{entityName}}Keys.detail(id),
      (old{{EntityName}}: {{EntityName}} | undefined) => {
        if (!old{{EntityName}}) return undefined;
        return { ...old{{EntityName}}, ...updates };
      }
    );

    // Also update in lists
    queryClient.setQueriesData(
      { queryKey: {{entityName}}Keys.lists() },
      (oldData: {{EntityName}}[] | undefined) => {
        if (!oldData) return undefined;
        return oldData.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );
      }
    );
  };

  return { updateCache };
}

// ============================================================================

// Example 6: Cache inspection

function useCacheDebug() {
  const queryClient = useQueryClient();

  const inspectCache = () => {
    // Get all {{entityName}} queries in cache
    const cache = queryClient.getQueryCache();
    const {{entityName}}Queries = cache
      .getAll()
      .filter((query) =>
        query.queryKey[0] === '{{entityName}}'
      );

    console.log('{{EntityName}} queries in cache:', {{entityName}}Queries);

    // Get specific {{entityName}} from cache
    const {{entityName}} = queryClient.getQueryData(
      {{entityName}}Keys.detail('123')
    );
    console.log('{{EntityName}} 123:', {{entityName}});
  };

  return { inspectCache };
}

*/

// ============================================================================
// ADVANCED PATTERNS
// ============================================================================

/*
// Pattern 1: Query key with multiple parameters

export const {{entityName}}Keys = {
  // ... existing keys ...

  byStatus: (status: string, filters?: Record<string, unknown>) =>
    [...{{entityName}}Keys.all, 'by-status', status, { filters }] as const,

  byDateRange: (startDate: Date, endDate: Date) =>
    [...{{entityName}}Keys.all, 'by-date-range', { startDate, endDate }] as const,
};

// ============================================================================

// Pattern 2: Nested resource keys

export const {{entityName}}Keys = {
  // ... existing keys ...

  // {{entityName}}'s related resources
  orders: ({{entityName}}Id: string) =>
    [...{{entityName}}Keys.detail({{entityName}}Id), 'orders'] as const,

  order: ({{entityName}}Id: string, orderId: string) =>
    [...{{entityName}}Keys.orders({{entityName}}Id), orderId] as const,
};

// Usage:
queryClient.invalidateQueries({
  queryKey: {{entityName}}Keys.orders('user-123')
});

// ============================================================================

// Pattern 3: Query key with sorting

export const {{entityName}}Keys = {
  // ... existing keys ...

  listSorted: (
    filters?: Record<string, unknown>,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) =>
    [
      ...{{entityName}}Keys.lists(),
      { filters, sort: { by: sortBy, order: sortOrder } }
    ] as const,
};

*/

