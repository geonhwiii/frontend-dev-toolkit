---
name: fsd-architecture
description: Helps implement and validate Feature-Sliced Design (FSD) architecture for React projects. Use when creating FSD folder structures, generating slices (entities, features, widgets), validating layer dependencies, managing public APIs (index.ts), organizing React Query with FSD, or when user mentions FSD, feature-sliced design, layers, slices, entities folder, features folder, widgets folder, architecture structure, dependency rules, or public API.
---

# FSD Architecture Skill

This skill helps implement Feature-Sliced Design (FSD) architecture in React projects with automatic structure generation, dependency validation, and React Query integration.

## Overview

Feature-Sliced Design (FSD) is a modern architectural methodology for frontend projects that organizes code into standardized layers and slices to improve maintainability, scalability, and team collaboration.

## Capabilities

### 1. Structure Generation
- Create complete FSD folder structure
- Generate layer-specific slices with proper organization
- Setup public API (index.ts) files automatically
- Integrate React Query patterns in entity/feature slices

### 2. Dependency Validation
- Check layer dependency rules (app → pages → widgets → features → entities → shared)
- Detect circular dependencies between slices
- Validate import paths comply with Public API rule
- Flag cross-slice imports within the same layer

### 3. Slice Management
- Create new slices with proper segment structure (ui, api, model, lib)
- Generate boilerplate code based on layer type
- Ensure proper barrel exports (index.ts)
- Integrate React Query setup for entities

### 4. Best Practices Enforcement
- Enforce Public API usage (only import from index.ts)
- Suggest proper layer placement for new features
- Guide on segment organization (ui, api, model, lib)
- Recommend FSD-compliant patterns

## FSD Layer Structure

### Layers (Top to Bottom)

1. **app** (레벨 6)
   - **Purpose**: Application initialization, routing, global providers
   - **Can import from**: pages, widgets, features, entities, shared
   - **Examples**: App.tsx, Router.tsx, ThemeProvider

2. **pages** (레벨 5)
   - **Purpose**: Full pages or nested routes
   - **Can import from**: widgets, features, entities, shared
   - **Examples**: HomePage, UserProfilePage, DashboardPage

3. **widgets** (레벨 4)
   - **Purpose**: Large independent UI/feature blocks
   - **Can import from**: features, entities, shared
   - **Examples**: Header, Sidebar, ProductCarousel

4. **features** (레벨 3)
   - **Purpose**: Reusable business functionality
   - **Can import from**: entities, shared
   - **Examples**: auth (login, logout), edit-user, add-to-cart

5. **entities** (레벨 2)
   - **Purpose**: Core domain elements
   - **Can import from**: shared only
   - **Examples**: user, product, order, comment

6. **shared** (레벨 1)
   - **Purpose**: General utilities and components
   - **Can import from**: nothing (base layer)
   - **Examples**: ui (Button, Input), lib (utils), api (apiClient)

### Dependency Rules

```
app → pages → widgets → features → entities → shared
```

**Rule**: Higher layers can only import from lower layers. This ensures unidirectional data flow and prevents circular dependencies.

## Segment Organization

Each slice can contain the following segments:

- **ui/**: UI components
- **api/**: API functions, React Query setup
- **model/**: Types, interfaces, business logic
- **lib/**: Utilities specific to this slice
- **config/**: Configuration

## Public API Pattern

Each slice must export through `index.ts`:

```typescript
// ✅ Good: Import from public API
import { User, useUser } from '@/entities/user';

// ❌ Bad: Direct import bypassing public API
import { User } from '@/entities/user/model/types';
```

## React Query Integration with FSD

### Entity Layer (entities/user/)

```
entities/user/
├── index.ts                    # Public API
├── model/
│   ├── types.ts               # interface User { ... }
│   └── index.ts
├── api/
│   ├── user.queries.ts        # queryOptions factories
│   ├── user.keys.ts           # Query key factory
│   ├── user.api.ts            # API functions
│   └── index.ts
└── ui/
    ├── UserCard.tsx           # UI components
    └── index.ts
```

**Key Pattern**: Entity layer contains the data model and basic CRUD operations using React Query.

### Features Layer (features/edit-user/)

```
features/edit-user/
├── index.ts
├── api/
│   ├── useUpdateUser.ts       # Mutation hook
│   └── index.ts
└── ui/
    ├── EditUserForm.tsx
    └── index.ts
```

**Key Pattern**: Features layer contains mutations and complex business logic built on top of entities.

## When This Skill Activates

This skill automatically activates when the user:

- Mentions "FSD" or "Feature-Sliced Design"
- Asks to create or organize folder structure
- Wants to create an entity, feature, or widget
- Needs to validate architecture or dependencies
- Mentions layers, slices, or architecture structure
- Asks about React Query integration with FSD
- Wants to setup public APIs or index.ts files
- Needs guidance on where to place code

## Usage Examples

### Example 1: Creating an Entity

**User**: "user entity를 만들어줘"

**Response**:
1. Create `entities/user/` directory
2. Generate structure:
   ```
   entities/user/
   ├── index.ts                 # Export all public APIs
   ├── model/
   │   ├── types.ts            # interface User
   │   └── index.ts
   ├── api/
   │   ├── user.queries.ts     # userQueries with queryOptions
   │   ├── user.keys.ts        # userKeys factory
   │   ├── user.api.ts         # API functions
   │   └── index.ts
   └── ui/
       ├── UserCard.tsx
       └── index.ts
   ```
3. Generate boilerplate code with React Query integration

### Example 2: Creating a Feature

**User**: "add-to-cart 기능을 만들고 싶어"

**Response**:
1. Create `features/add-to-cart/` directory
2. Generate structure:
   ```
   features/add-to-cart/
   ├── index.ts
   ├── api/
   │   ├── useAddToCart.ts     # Mutation hook
   │   └── index.ts
   ├── ui/
   │   ├── AddToCartButton.tsx
   │   └── index.ts
   └── model/
       └── types.ts            # AddToCartParams, etc.
   ```
3. Import from `entities/product` and `entities/cart`
4. Implement mutation with optimistic updates

### Example 3: Validating Architecture

**User**: "FSD 구조가 맞게 되어있는지 확인해줘"

**Response**:
1. Scan project structure
2. Check layer dependency rules
3. Validate public API usage
4. Generate report:
   ```
   ✅ Structure: Valid
   ⚠️ Dependencies: 2 violations found

   Violations:
   1. features/auth imports from features/user
      → Avoid cross-slice imports within same layer

   2. entities/product imports from features/cart
      → Lower layer cannot import from higher layer
      → Suggestion: Move shared logic to entities/cart
   ```

### Example 4: Initial Setup

**User**: "FSD 프로젝트를 시작하고 싶어"

**Response**:
1. Create base structure:
   ```
   src/
   ├── app/
   │   ├── providers/
   │   ├── styles/
   │   └── index.tsx
   ├── pages/
   ├── widgets/
   ├── features/
   ├── entities/
   └── shared/
       ├── api/
       │   ├── client.ts       # API client
       │   └── query-client.ts # QueryClient setup
       ├── ui/                 # Common components
       ├── lib/                # Utilities
       └── config/
   ```
2. Setup React Query provider
3. Create configuration files

## Templates and Files

The skill uses the following templates from the plugin:

- `templates/entity-slice.template.ts`: Entity boilerplate with React Query
- `templates/feature-slice.template.ts`: Feature boilerplate
- `templates/widget-slice.template.ts`: Widget boilerplate
- `rules/dependency-rules.json`: Layer dependency configuration
- `validators/structure-validator.js`: Structure validation script

## Best Practices

### 1. Naming Conventions

- **Layers**: lowercase (entities, features, widgets)
- **Slices**: kebab-case (user-profile, add-to-cart)
- **Files**: PascalCase for components, camelCase for utilities
- **Types**: PascalCase interfaces

### 2. Slice Size

- Keep slices focused on a single domain concern
- Split large slices into multiple smaller ones
- Avoid god slices that handle too many responsibilities

### 3. Cross-Slice Communication

- Use shared/api for common API client
- Use shared/lib for shared utilities
- Avoid direct imports between slices in the same layer
- Communicate through Public APIs only

### 4. React Query Placement

- **Queries** → `entities/{entity}/api/`: Basic CRUD operations
- **Mutations** → `features/{feature}/api/`: Business logic mutations
- **Query Client** → `shared/api/query-client.ts`: Global configuration
- **Custom Hooks** → Wrap queries in semantic hooks

### 5. Testing

- Test entities independently (unit tests)
- Test features with mocked entities (integration tests)
- Test pages with full setup (E2E tests)

## Common Patterns

### Pattern 1: Entity with React Query

```typescript
// entities/user/api/user.keys.ts
export const userKeys = {
  all: ['user'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// entities/user/api/user.queries.ts
export const userQueries = {
  detail: (id: string) => queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
  }),
};

// entities/user/index.ts (Public API)
export { userQueries, userKeys } from './api';
export type { User } from './model';
export { UserCard } from './ui';
```

### Pattern 2: Feature with Mutation

```typescript
// features/edit-user/api/useUpdateUser.ts
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateUserParams) => userApi.update(params),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

// features/edit-user/index.ts (Public API)
export { useUpdateUser } from './api';
export { EditUserForm } from './ui';
```

### Pattern 3: Shared API Client

```typescript
// shared/api/client.ts
export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create(config);
    this.setupInterceptors();
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

## Troubleshooting

### Issue: "Cannot find module '@/entities/user'"

**Solution**: Configure path aliases in tsconfig.json:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Issue: Circular dependency between slices

**Solution**:
1. Extract shared logic to a lower layer (usually shared/)
2. Rethink slice boundaries - might need to split or merge slices
3. Use dependency inversion (interfaces in shared, implementations in slices)

### Issue: Too many exports in index.ts

**Solution**:
- Group related exports
- Consider splitting the slice into smaller units
- Use re-export patterns:
  ```typescript
  export * from './model';
  export * from './api';
  export { UserCard, UserList } from './ui';
  ```

## Additional Resources

- [FSD Official Documentation](https://feature-sliced.design)
- [FSD + React Query Guide](https://feature-sliced.design/docs/guides/tech/with-react-query)
- [Examples Repository](https://github.com/feature-sliced/examples)

---

## Implementation Details

When activated, this skill will:

1. **Analyze** the user's request to determine the type of work needed
2. **Generate** appropriate file structures using templates
3. **Validate** existing code against FSD rules
4. **Suggest** improvements and best practices
5. **Integrate** React Query patterns where applicable
6. **Guide** the user through FSD concepts if they're learning

The skill prioritizes practical implementation while teaching FSD principles through examples and explanations.
