// ============================================================================
// Mutation Hook Template
// ============================================================================
// This template generates custom mutation hooks for write operations
// (create, update, delete) with optimistic updates and cache invalidation.
//
// Usage:
//   Replace {{entityName}} with camelCase name (e.g., user, product)
//   Replace {{EntityName}} with PascalCase name (e.g., User, Product)
//   Replace {{operation}} with operation name (e.g., update, delete, create)
//   Replace {{Operation}} with PascalCase operation (e.g., Update, Delete, Create)
//   Replace {{featureName}} with feature name (e.g., editUser, deleteProduct)
//
// Location: features/{{featureName}}/api/use{{Operation}}{{EntityName}}.ts
// ============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { {{entityName}}Api, {{entityName}}Keys } from '@/entities/{{entityName}}';
import type { {{EntityName}} } from '@/entities/{{entityName}}';

// ============================================================================
// CREATE MUTATION
// ============================================================================

/**
 * Parameters for creating a {{entityName}}
 */
export interface Create{{EntityName}}Params {
  // TODO: Add creation parameters
  name: string;
  // ... other fields
}

/**
 * Hook for creating a new {{entityName}}
 *
 * @example
 * ```typescript
 * function Create{{EntityName}}Form() {
 *   const { mutate, isPending } = useCreate{{EntityName}}();
 *
 *   const handleSubmit = (data: Create{{EntityName}}Params) => {
 *     mutate(data, {
 *       onSuccess: (new{{EntityName}}) => {
 *         toast.success('{{EntityName}} created!');
 *         navigate(`/{{entityName}}s/${new{{EntityName}}.id}`);
 *       },
 *       onError: (error) => {
 *         toast.error('Failed to create {{entityName}}');
 *       },
 *     });
 *   };
 *
 *   return <Form onSubmit={handleSubmit} isLoading={isPending} />;
 * }
 * ```
 */
export function useCreate{{EntityName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Create{{EntityName}}Params): Promise<{{EntityName}}> => {
      const new{{EntityName}} = await {{entityName}}Api.create(params);
      return new{{EntityName}};
    },

    onSuccess: (new{{EntityName}}) => {
      // Invalidate lists to show new item
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.lists()
      });

      // Optionally set detail cache for instant navigation
      queryClient.setQueryData(
        {{entityName}}Keys.detail(new{{EntityName}}.id),
        new{{EntityName}}
      );
    },

    onError: (error) => {
      console.error('Failed to create {{entityName}}:', error);
    },
  });
}

// ============================================================================
// UPDATE MUTATION
// ============================================================================

/**
 * Parameters for updating a {{entityName}}
 */
export interface Update{{EntityName}}Params {
  id: string;
  data: Partial<{{EntityName}}>;
}

/**
 * Hook for updating a {{entityName}} with optimistic updates
 *
 * @example
 * ```typescript
 * function Edit{{EntityName}}Form({ {{entityName}} }: { {{entityName}}: {{EntityName}} }) {
 *   const { mutate, isPending } = useUpdate{{EntityName}}();
 *
 *   const handleSubmit = (data: Partial<{{EntityName}}>) => {
 *     mutate(
 *       { id: {{entityName}}.id, data },
 *       {
 *         onSuccess: () => {
 *           toast.success('{{EntityName}} updated!');
 *         },
 *       }
 *     );
 *   };
 *
 *   return <Form onSubmit={handleSubmit} isLoading={isPending} />;
 * }
 * ```
 */
export function useUpdate{{EntityName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: Update{{EntityName}}Params): Promise<{{EntityName}}> => {
      const updated{{EntityName}} = await {{entityName}}Api.update(params.id, params.data);
      return updated{{EntityName}};
    },

    // Optimistic update
    onMutate: async (params) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: {{entityName}}Keys.detail(params.id)
      });

      // Snapshot previous value for rollback
      const previous{{EntityName}} = queryClient.getQueryData<{{EntityName}}>(
        {{entityName}}Keys.detail(params.id)
      );

      // Optimistically update cache
      queryClient.setQueryData<{{EntityName}}>(
        {{entityName}}Keys.detail(params.id),
        (old) => {
          if (!old) return old;
          return { ...old, ...params.data };
        }
      );

      // Return context with snapshot for rollback
      return { previous{{EntityName}} };
    },

    // Rollback on error
    onError: (error, params, context) => {
      if (context?.previous{{EntityName}}) {
        queryClient.setQueryData(
          {{entityName}}Keys.detail(params.id),
          context.previous{{EntityName}}
        );
      }
      console.error('Failed to update {{entityName}}:', error);
    },

    // Refetch after success or error
    onSettled: (data, error, params) => {
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.detail(params.id)
      });
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.lists()
      });
    },
  });
}

// ============================================================================
// DELETE MUTATION
// ============================================================================

/**
 * Hook for deleting a {{entityName}} with optimistic updates
 *
 * @example
 * ```typescript
 * function Delete{{EntityName}}Button({ {{entityName}}Id }: { {{entityName}}Id: string }) {
 *   const { mutate, isPending } = useDelete{{EntityName}}();
 *
 *   const handleDelete = () => {
 *     if (confirm('Are you sure?')) {
 *       mutate({{entityName}}Id, {
 *         onSuccess: () => {
 *           toast.success('{{EntityName}} deleted!');
 *           navigate('/{{entityName}}s');
 *         },
 *       });
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={isPending}>
 *       {isPending ? 'Deleting...' : 'Delete'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDelete{{EntityName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await {{entityName}}Api.delete(id);
    },

    // Optimistic delete
    onMutate: async (id) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: {{entityName}}Keys.detail(id)
      });
      await queryClient.cancelQueries({
        queryKey: {{entityName}}Keys.lists()
      });

      // Snapshot previous values
      const previous{{EntityName}} = queryClient.getQueryData<{{EntityName}}>(
        {{entityName}}Keys.detail(id)
      );
      const previous{{EntityName}}Lists = queryClient.getQueriesData({
        queryKey: {{entityName}}Keys.lists()
      });

      // Optimistically remove from cache
      queryClient.removeQueries({
        queryKey: {{entityName}}Keys.detail(id)
      });

      // Optimistically remove from lists
      queryClient.setQueriesData<{{EntityName}}[]>(
        { queryKey: {{entityName}}Keys.lists() },
        (old) => old?.filter((item) => item.id !== id)
      );

      return { previous{{EntityName}}, previous{{EntityName}}Lists };
    },

    // Rollback on error
    onError: (error, id, context) => {
      if (context?.previous{{EntityName}}) {
        queryClient.setQueryData(
          {{entityName}}Keys.detail(id),
          context.previous{{EntityName}}
        );
      }

      if (context?.previous{{EntityName}}Lists) {
        context.previous{{EntityName}}Lists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      console.error('Failed to delete {{entityName}}:', error);
    },

    // Refetch to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.all
      });
    },
  });
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Create form with mutation

import { useCreate{{EntityName}} } from '@/features/create-{{entityName}}';

function Create{{EntityName}}Form() {
  const { mutate: create{{EntityName}}, isPending, isError, error } = useCreate{{EntityName}}();
  const [formData, setFormData] = useState<Create{{EntityName}}Params>({
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create{{EntityName}}(formData, {
      onSuccess: (new{{EntityName}}) => {
        toast.success('{{EntityName}} created successfully!');
        navigate(`/{{entityName}}s/${new{{EntityName}}.id}`);
      },
      onError: (error) => {
        toast.error(`Failed to create {{entityName}}: ${error.message}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={isPending}
      />
      {isError && <div className="error">{error.message}</div>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create {{EntityName}}'}
      </button>
    </form>
  );
}

// ============================================================================

// Example 2: Edit form with optimistic update

import { useUpdate{{EntityName}} } from '@/features/edit-{{entityName}}';

function Edit{{EntityName}}Form({ {{entityName}} }: { {{entityName}}: {{EntityName}} }) {
  const { mutate: update{{EntityName}}, isPending } = useUpdate{{EntityName}}();
  const [formData, setFormData] = useState({{entityName}});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update{{EntityName}}({
      id: {{entityName}}.id,
      data: formData,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={isPending}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

// ============================================================================

// Example 3: Delete with confirmation

import { useDelete{{EntityName}} } from '@/features/delete-{{entityName}}';

function {{EntityName}}Card({ {{entityName}} }: { {{entityName}}: {{EntityName}} }) {
  const { mutate: delete{{EntityName}}, isPending } = useDelete{{EntityName}}();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    delete{{EntityName}}({{entityName}}.id, {
      onSuccess: () => {
        toast.success('{{EntityName}} deleted!');
        setShowConfirm(false);
      },
    });
  };

  return (
    <div className="card">
      <h3>{{{entityName}}.name}</h3>
      <button onClick={() => setShowConfirm(true)}>Delete</button>

      {showConfirm && (
        <ConfirmDialog
          title="Delete {{EntityName}}?"
          message="This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          isLoading={isPending}
        />
      )}
    </div>
  );
}

// ============================================================================

// Example 4: Bulk operations

function useBulkDelete{{EntityName}}s() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]): Promise<void> => {
      await Promise.all(ids.map((id) => {{entityName}}Api.delete(id)));
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.all });
      toast.success('{{EntityName}}s deleted successfully!');
    },
  });
}

// Usage:
function {{EntityName}}BulkActions({ selectedIds }: { selectedIds: string[] }) {
  const { mutate: bulkDelete, isPending } = useBulkDelete{{EntityName}}s();

  return (
    <button
      onClick={() => bulkDelete(selectedIds)}
      disabled={isPending || selectedIds.length === 0}
    >
      Delete Selected ({selectedIds.length})
    </button>
  );
}

*/

// ============================================================================
// ADVANCED PATTERNS
// ============================================================================

/*
// Pattern 1: Mutation with toast notifications

import { toast } from 'react-hot-toast';

export function useUpdate{{EntityName}}WithToast() {
  const mutation = useUpdate{{EntityName}}();

  return useMutation({
    ...mutation,
    onSuccess: (data, variables) => {
      mutation.onSuccess?.(data, variables, undefined);
      toast.success('{{EntityName}} updated successfully!');
    },
    onError: (error, variables, context) => {
      mutation.onError?.(error, variables, context);
      toast.error(`Failed to update {{entityName}}: ${error.message}`);
    },
  });
}

// ============================================================================

// Pattern 2: Mutation with complex business logic

export function useArchive{{EntityName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Complex business logic
      const {{entityName}} = await {{entityName}}Api.getById(id);

      if ({{entityName}}.hasActiveOrders) {
        throw new Error('Cannot archive {{entityName}} with active orders');
      }

      await {{entityName}}Api.update(id, { status: 'archived' });
      await auditApi.log({ action: 'archive', entityId: id });

      return {{entityName}};
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: {{entityName}}Keys.all });
    },
  });
}

// ============================================================================

// Pattern 3: Mutation with multiple cache updates

export function useTransfer{{EntityName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; targetId: string }) => {
      return await {{entityName}}Api.transfer(params.id, params.targetId);
    },

    onSuccess: (data, variables) => {
      // Update source
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.detail(variables.id)
      });

      // Update target
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.detail(variables.targetId)
      });

      // Update lists
      queryClient.invalidateQueries({
        queryKey: {{entityName}}Keys.lists()
      });
    },
  });
}

*/

