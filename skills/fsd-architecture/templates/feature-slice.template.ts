// ============================================================================
// FSD Feature Slice Template
// ============================================================================
// This template generates a complete feature slice structure following FSD
// architecture principles. Features contain reusable business functionality
// that typically involve mutations, complex logic, or user interactions.
//
// Usage:
//   Replace {{featureName}} with kebab-case name (e.g., edit-user, add-to-cart)
//   Replace {{FeatureName}} with PascalCase name (e.g., EditUser, AddToCart)
//
// Generated structure:
//   features/{{featureName}}/
//   ├── index.ts                    # Public API
//   ├── api/
//   │   ├── use{{FeatureName}}.ts   # Custom mutation hook
//   │   └── index.ts
//   ├── ui/
//   │   ├── {{FeatureName}}Form.tsx # Main UI component
//   │   └── index.ts
//   └── model/
//       ├── types.ts                # Feature-specific types
//       └── index.ts
// ============================================================================

// ============================================================================
// File: features/{{featureName}}/index.ts
// Public API - Export what should be accessible from other layers
// ============================================================================

export { use{{FeatureName}} } from './api';
export { {{FeatureName}}Form } from './ui';
export type { {{FeatureName}}Params, {{FeatureName}}Result } from './model';


// ============================================================================
// File: features/{{featureName}}/model/types.ts
// Feature-specific types and interfaces
// ============================================================================

/**
 * Parameters for {{featureName}} operation
 */
export interface {{FeatureName}}Params {
  // TODO: Add parameters specific to this feature
  // Example for edit-user:
  // userId: string;
  // name: string;
  // email: string;
}

/**
 * Result of {{featureName}} operation
 */
export interface {{FeatureName}}Result {
  success: boolean;
  message?: string;
  // TODO: Add result fields
}

/**
 * Form state for {{featureName}}
 */
export interface {{FeatureName}}FormState {
  // TODO: Add form fields
  isSubmitting: boolean;
  errors: Record<string, string>;
}


// ============================================================================
// File: features/{{featureName}}/model/index.ts
// Model public exports
// ============================================================================

export type { {{FeatureName}}Params, {{FeatureName}}Result, {{FeatureName}}FormState } from './types';


// ============================================================================
// File: features/{{featureName}}/api/use{{FeatureName}}.ts
// Custom mutation hook for this feature
// ============================================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
// Import entities that this feature depends on
// Example: import { userApi, userKeys } from '@/entities/user';
import type { {{FeatureName}}Params, {{FeatureName}}Result } from '../model';

/**
 * Hook for {{featureName}} operation
 *
 * This hook encapsulates the business logic for {{featureName}},
 * including API calls, cache invalidation, and error handling.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { mutate, isPending } = use{{FeatureName}}();
 *
 *   const handleSubmit = (data: {{FeatureName}}Params) => {
 *     mutate(data, {
 *       onSuccess: () => {
 *         // Show success message
 *       },
 *       onError: (error) => {
 *         // Show error message
 *       },
 *     });
 *   };
 *
 *   return <{{FeatureName}}Form onSubmit={handleSubmit} isLoading={isPending} />;
 * }
 * ```
 */
export function use{{FeatureName}}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {{FeatureName}}Params): Promise<{{FeatureName}}Result> => {
      // TODO: Implement the actual API call
      // Example:
      // const result = await userApi.update(params.userId, {
      //   name: params.name,
      //   email: params.email,
      // });
      // return { success: true, message: 'Updated successfully' };

      // Placeholder implementation
      console.log('{{FeatureName}} params:', params);
      return { success: true, message: '{{FeatureName}} completed' };
    },

    onMutate: async (params) => {
      // Optional: Optimistic update
      // 1. Cancel outgoing queries
      // await queryClient.cancelQueries({ queryKey: userKeys.detail(params.userId) });
      //
      // 2. Snapshot previous value
      // const previousUser = queryClient.getQueryData(userKeys.detail(params.userId));
      //
      // 3. Optimistically update cache
      // queryClient.setQueryData(userKeys.detail(params.userId), (old) => ({
      //   ...old,
      //   ...params,
      // }));
      //
      // 4. Return context with snapshot
      // return { previousUser };
    },

    onSuccess: (data, variables, context) => {
      // Invalidate and refetch relevant queries
      // TODO: Invalidate appropriate query keys
      // Example:
      // queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      // queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      console.log('{{FeatureName}} succeeded:', data);
    },

    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      // if (context?.previousUser) {
      //   queryClient.setQueryData(
      //     userKeys.detail(variables.userId),
      //     context.previousUser
      //   );
      // }

      console.error('{{FeatureName}} failed:', error);
    },

    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      // queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
    },
  });
}


// ============================================================================
// File: features/{{featureName}}/api/index.ts
// API public exports
// ============================================================================

export { use{{FeatureName}} } from './use{{FeatureName}}';


// ============================================================================
// File: features/{{featureName}}/ui/{{FeatureName}}Form.tsx
// Main UI component for this feature
// ============================================================================

import { useState } from 'react';
import type { {{FeatureName}}Params, {{FeatureName}}FormState } from '../model';

interface {{FeatureName}}FormProps {
  onSubmit: (data: {{FeatureName}}Params) => void;
  isLoading?: boolean;
  initialValues?: Partial<{{FeatureName}}Params>;
}

/**
 * {{FeatureName}}Form component
 *
 * Form for {{featureName}} operation with validation and error handling.
 */
export function {{FeatureName}}Form({
  onSubmit,
  isLoading = false,
  initialValues = {},
}: {{FeatureName}}FormProps) {
  const [formState, setFormState] = useState<{{FeatureName}}FormState>({
    isSubmitting: false,
    errors: {},
  });

  // TODO: Add form fields state
  // const [fieldName, setFieldName] = useState(initialValues.fieldName ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement validation
    const errors: Record<string, string> = {};

    // if (!fieldName.trim()) {
    //   errors.fieldName = 'Field is required';
    // }

    if (Object.keys(errors).length > 0) {
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    // Clear errors and submit
    setFormState((prev) => ({ ...prev, errors: {} }));

    const data: {{FeatureName}}Params = {
      // TODO: Collect form data
      // fieldName,
    } as {{FeatureName}}Params;

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="{{featureName}}-form">
      <h2>{{FeatureName}}</h2>

      {/* TODO: Add form fields */}
      {/* Example:
      <div className="form-field">
        <label htmlFor="fieldName">Field Name</label>
        <input
          id="fieldName"
          type="text"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          disabled={isLoading}
        />
        {formState.errors.fieldName && (
          <span className="error">{formState.errors.fieldName}</span>
        )}
      </div>
      */}

      <div className="form-actions">
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}


// ============================================================================
// File: features/{{featureName}}/ui/index.ts
// UI public exports
// ============================================================================

export { {{FeatureName}}Form } from './{{FeatureName}}Form';


// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Using the feature in a page component

import { use{{FeatureName}}, {{FeatureName}}Form } from '@/features/{{featureName}}';

function {{FeatureName}}Page() {
  const { mutate, isPending, isSuccess, isError, error } = use{{FeatureName}}();

  const handleSubmit = (data) => {
    mutate(data, {
      onSuccess: () => {
        alert('Success!');
        // Navigate or show toast
      },
      onError: (error) => {
        alert(`Error: ${error.message}`);
      },
    });
  };

  return (
    <div className="page">
      <h1>{{FeatureName}}</h1>

      {isSuccess && <div className="success">Operation completed!</div>}
      {isError && <div className="error">Error: {error?.message}</div>}

      <{{FeatureName}}Form onSubmit={handleSubmit} isLoading={isPending} />
    </div>
  );
}

// ============================================================================

// Example 2: With React Hook Form integration

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { use{{FeatureName}} } from '@/features/{{featureName}}';

const schema = z.object({
  // Define schema
});

type FormData = z.infer<typeof schema>;

function {{FeatureName}}FormWithRHF() {
  const { mutate, isPending } = use{{FeatureName}}();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        Submit
      </button>
    </form>
  );
}

// ============================================================================

// Example 3: With optimistic updates

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, userKeys } from '@/entities/user';

function useUpdateUserFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.update,

    onMutate: async (params) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: userKeys.detail(params.id)
      });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(userKeys.detail(params.id));

      // Optimistically update
      queryClient.setQueryData(userKeys.detail(params.id), (old) => ({
        ...old,
        ...params.data,
      }));

      return { previousUser };
    },

    onError: (err, params, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(params.id),
          context.previousUser
        );
      }
    },

    onSettled: (data, error, params) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(params.id)
      });
    },
  });
}

// ============================================================================

// Example 4: With toast notifications

import { toast } from 'react-hot-toast';
import { use{{FeatureName}} } from '@/features/{{featureName}}';

function ComponentWithToast() {
  const { mutate } = use{{FeatureName}}();

  const handleAction = (data) => {
    toast.promise(
      new Promise((resolve, reject) => {
        mutate(data, {
          onSuccess: resolve,
          onError: reject,
        });
      }),
      {
        loading: 'Processing...',
        success: 'Success!',
        error: 'Failed!',
      }
    );
  };

  return <button onClick={() => handleAction({...})}>Do Action</button>;
}

*/
