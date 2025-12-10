---
description: Create a new FSD slice (entity, feature, or widget) with proper structure and boilerplate code
---

# FSD Slice Command

Create a new FSD slice with the appropriate structure, boilerplate code, and React Query integration based on the layer type.

## What This Command Does

This command generates a complete slice structure with:

1. **Proper directory structure** based on layer type
2. **Boilerplate code** from templates
3. **React Query setup** (for entities and features)
4. **Public API (index.ts)** with proper exports
5. **Type definitions** and interfaces

## Steps

### 1. Ask User for Slice Configuration

Ask the following questions:

**Question 1: Layer**
- "Which layer should this slice be in?"
- Options:
  - `entity` - Core domain elements (user, product, order, etc.)
  - `feature` - Business functionality (add-to-cart, edit-user, etc.)
  - `widget` - Large UI blocks (header, sidebar, user-profile, etc.)

**Question 2: Slice Name**
- "What is the name of the slice?"
- Format:
  - Entities: singular noun (user, product, order, comment)
  - Features: verb-noun (add-to-cart, edit-user, delete-product)
  - Widgets: descriptive name (user-profile, product-carousel, navigation-menu)
- Validation:
  - Must be lowercase
  - Use kebab-case for multi-word names
  - No spaces or special characters

**Question 3: Segments** (multi-select)
- "Which segments do you need?"
- Options (vary by layer):
  - `ui` - UI components (always recommended)
  - `api` - API functions, queries, mutations (for entities/features)
  - `model` - Types, interfaces, business logic (always recommended)
  - `lib` - Utilities specific to this slice (optional)
  - `config` - Configuration files (optional)

**Question 4: React Query Integration** (only for entities)
- "Include React Query setup?"
- Default: Yes (recommended for entities)
- If Yes: Generates queryOptions, queryKeyFactory, API functions

### 2. Generate Directory Structure

Based on layer and selected segments, create the appropriate structure:

#### Entity Slice

```
entities/{{sliceName}}/
├── index.ts                    # Public API
├── model/
│   ├── types.ts               # Domain types
│   └── index.ts
├── api/ (if React Query = Yes)
│   ├── {{sliceName}}.queries.ts   # queryOptions factories
│   ├── {{sliceName}}.keys.ts      # Query key factory
│   ├── {{sliceName}}.api.ts       # API functions
│   └── index.ts
├── ui/ (if selected)
│   ├── {{SliceName}}Card.tsx      # Example component
│   └── index.ts
└── lib/ (if selected)
    └── utils.ts
```

#### Feature Slice

```
features/{{sliceName}}/
├── index.ts                    # Public API
├── api/
│   ├── use{{SliceName}}.ts    # Mutation hook
│   └── index.ts
├── ui/
│   ├── {{SliceName}}Form.tsx  # Main component
│   └── index.ts
├── model/ (if selected)
│   ├── types.ts
│   └── index.ts
└── lib/ (if selected)
    └── utils.ts
```

#### Widget Slice

```
widgets/{{sliceName}}/
├── index.ts                    # Public API
├── ui/
│   ├── {{SliceName}}.tsx      # Main widget component
│   └── index.ts
├── model/ (if selected)
│   ├── types.ts
│   └── index.ts
└── lib/ (if selected)
    └── utils.ts
```

### 3. Generate Code from Templates

Use the appropriate template based on layer:

#### For Entities
- Use `entity-slice.template.ts`
- Replace placeholders:
  - `{{entityName}}` → camelCase (e.g., user, product)
  - `{{EntityName}}` → PascalCase (e.g., User, Product)
- Generate all files:
  - model/types.ts
  - api/*.ts (queries, keys, api)
  - ui/{{EntityName}}Card.tsx
  - index.ts

#### For Features
- Use `feature-slice.template.ts`
- Replace placeholders:
  - `{{featureName}}` → kebab-case (e.g., add-to-cart)
  - `{{FeatureName}}` → PascalCase (e.g., AddToCart)
- Generate all files:
  - api/use{{FeatureName}}.ts
  - ui/{{FeatureName}}Form.tsx
  - model/types.ts
  - index.ts

#### For Widgets
- Use `widget-slice.template.ts`
- Replace placeholders:
  - `{{widgetName}}` → kebab-case (e.g., user-profile)
  - `{{WidgetName}}` → PascalCase (e.g., UserProfile)
- Generate all files:
  - ui/{{WidgetName}}.tsx
  - model/types.ts
  - index.ts

### 4. Customize Generated Code

After generating, optionally customize:

#### For Entities with React Query:
1. **API Endpoints**: Update API URLs in `{{entity}}.api.ts`
   ```typescript
   // Change this:
   const response = await apiClient.get('/api/{{entityName}}s');

   // To actual endpoint:
   const response = await apiClient.get('/api/v1/users');
   ```

2. **DTO Mapping**: Customize DTO to domain model transformation
   ```typescript
   function mapDtoToDomain(dto: UserDto): User {
     return {
       id: dto.id.toString(),
       name: dto.name,
       // Add custom transformations
     };
   }
   ```

3. **Type Definitions**: Add actual fields to interfaces in `model/types.ts`

#### For Features:
1. **Mutation Logic**: Implement actual API call in `use{{Feature}}.ts`
2. **Form Fields**: Add real form inputs in `{{Feature}}Form.tsx`
3. **Validation**: Add form validation logic

#### For Widgets:
1. **Composition**: Import and compose features/entities
2. **Data Fetching**: Add queries using entities
3. **Layout**: Customize component structure

### 5. Validate and Show Summary

After generation, validate:

1. **Check dependencies**: Ensure entity imports work for features/widgets
2. **Verify Public API**: Ensure index.ts exports are correct
3. **Check layer rules**: Confirm no dependency violations

Show summary:

```
✅ {{LayerName}} slice '{{sliceName}}' created successfully!

Location: src/{{layer}}/{{sliceName}}/

Generated files:
- index.ts (Public API)
- model/types.ts
{{#if api}}
- api/{{sliceName}}.queries.ts
- api/{{sliceName}}.keys.ts
- api/{{sliceName}}.api.ts
{{/if}}
{{#if ui}}
- ui/{{SliceName}}Component.tsx
{{/if}}

Next steps:
1. Customize type definitions in model/types.ts
{{#if entity}}
2. Update API endpoints in api/{{sliceName}}.api.ts
3. Test queries: useSuspenseQuery({{sliceName}}Queries.all())
{{/if}}
{{#if feature}}
2. Implement mutation logic in api/use{{SliceName}}.ts
3. Add form validation in ui/{{SliceName}}Form.tsx
{{/if}}
{{#if widget}}
2. Compose features and entities in ui/{{SliceName}}.tsx
3. Add data fetching with queries from entities
{{/if}}

Import this slice:
import { {{exports}} } from '@/{{layer}}/{{sliceName}}';
```

## Examples

### Example 1: Create User Entity

```
User input: /fsd-slice
Layer: entity
Name: user
Segments: ui, api, model
React Query: Yes

Result:
✅ Entity slice 'user' created!
Location: src/entities/user/

Generated:
- model/types.ts (User, UserDto, UserFilters)
- api/user.queries.ts (userQueries with queryOptions)
- api/user.keys.ts (userKeys factory)
- api/user.api.ts (userApi.getAll, getById, etc.)
- ui/UserCard.tsx
- index.ts (exports User, userQueries, UserCard)

Import:
import { User, userQueries, UserCard } from '@/entities/user';
```

### Example 2: Create Add-to-Cart Feature

```
User input: /fsd-slice
Layer: feature
Name: add-to-cart
Segments: ui, api, model

Result:
✅ Feature slice 'add-to-cart' created!
Location: src/features/add-to-cart/

Generated:
- api/useAddToCart.ts (mutation hook)
- ui/AddToCartForm.tsx
- model/types.ts (AddToCartParams, AddToCartResult)
- index.ts

Next: Implement mutation logic in api/useAddToCart.ts
Depends on: @/entities/product, @/entities/cart

Import:
import { useAddToCart, AddToCartForm } from '@/features/add-to-cart';
```

### Example 3: Create User Profile Widget

```
User input: /fsd-slice
Layer: widget
Name: user-profile
Segments: ui, model

Result:
✅ Widget slice 'user-profile' created!
Location: src/widgets/user-profile/

Generated:
- ui/UserProfile.tsx (with Suspense + ErrorBoundary)
- model/types.ts
- index.ts

Next: Compose entities and features in ui/UserProfile.tsx
Use: @/entities/user, @/features/edit-user

Import:
import { UserProfile } from '@/widgets/user-profile';
```

## Common Patterns

### Entity with Custom API

```typescript
// entities/product/api/product.api.ts
export const productApi = {
  async getAll(filters?: ProductFilters) {
    // Custom endpoint
    const response = await apiClient.get('/api/v2/products', {
      params: { ...filters, include: 'category,tags' },
    });
    return response.data.products.map(mapDtoToDomain);
  },

  async getFeatured() {
    // Additional custom method
    const response = await apiClient.get('/api/v2/products/featured');
    return response.data.map(mapDtoToDomain);
  },
};
```

### Feature with Dependencies

```typescript
// features/checkout/api/useCheckout.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi, cartKeys } from '@/entities/cart';
import { orderApi } from '@/entities/order';

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CheckoutParams) => {
      // Use multiple entities
      const cart = await cartApi.getCurrent();
      const order = await orderApi.create({
        items: cart.items,
        ...params,
      });
      return order;
    },

    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
```

### Widget Composition

```typescript
// widgets/product-showcase/ui/ProductShowcase.tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { productQueries, ProductCard } from '@/entities/product';
import { useAddToCart } from '@/features/add-to-cart';
import { useFavorite } from '@/features/favorite';

export function ProductShowcase() {
  const { data: products } = useSuspenseQuery(productQueries.featured());
  const { mutate: addToCart } = useAddToCart();
  const { mutate: toggleFavorite } = useFavorite();

  return (
    <div className="product-showcase">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => addToCart({ productId: product.id })}
          onFavorite={() => toggleFavorite({ productId: product.id })}
        />
      ))}
    </div>
  );
}
```

## Tips

1. **Naming Conventions**:
   - Entities: singular nouns (user, product, comment)
   - Features: action-oriented (add-to-cart, edit-profile)
   - Widgets: descriptive (navigation-menu, user-dashboard)

2. **Dependencies**:
   - Entities should NOT import from features/widgets
   - Features can import from entities and shared only
   - Widgets can import from features, entities, and shared

3. **React Query**:
   - Always use queryOptions pattern for entities
   - Use queryKeyFactory for cache invalidation
   - Prefer useSuspenseQuery in components

4. **Public API**:
   - Only export what's needed by other layers
   - Keep internal implementation private
   - Use barrel exports (index.ts)

5. **Testing**:
   - Test entities independently
   - Test features with mocked entities
   - Test widgets with full integration

## Troubleshooting

### "Cannot find module '@/entities/user'"

**Solution**: Ensure TypeScript path aliases are configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### "Circular dependency detected"

**Solution**: Check layer dependency rules. Lower layers cannot import from higher layers.

### "Type error in generated code"

**Solution**: Customize the generated types in `model/types.ts` to match your actual data structure.

## Follow-up Commands

After creating a slice:
- `/quality-check` - Validate code quality
- `/fsd-validate` - Check FSD structure compliance
- `/rq-entity` - Add more React Query patterns
