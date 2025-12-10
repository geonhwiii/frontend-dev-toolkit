// ============================================================================
// FSD Widget Slice Template
// ============================================================================
// This template generates a complete widget slice structure following FSD
// architecture principles. Widgets are large, independent UI/feature blocks
// that combine multiple features and entities.
//
// Usage:
//   Replace {{widgetName}} with kebab-case name (e.g., user-profile, product-carousel)
//   Replace {{WidgetName}} with PascalCase name (e.g., UserProfile, ProductCarousel)
//
// Generated structure:
//   widgets/{{widgetName}}/
//   ├── index.ts                    # Public API
//   ├── ui/
//   │   ├── {{WidgetName}}.tsx      # Main widget component
//   │   └── index.ts
//   ├── model/
//   │   ├── types.ts                # Widget-specific types
//   │   └── index.ts
//   └── lib/
//       ├── utils.ts                # Widget utilities
//       └── index.ts
// ============================================================================

// ============================================================================
// File: widgets/{{widgetName}}/index.ts
// Public API - Export what should be accessible from pages/app layers
// ============================================================================

export { {{WidgetName}} } from './ui';
export type { {{WidgetName}}Props } from './model';


// ============================================================================
// File: widgets/{{widgetName}}/model/types.ts
// Widget-specific types and interfaces
// ============================================================================

/**
 * Props for {{WidgetName}} widget
 */
export interface {{WidgetName}}Props {
  // TODO: Add props specific to this widget
  className?: string;
  // Example:
  // userId?: string;
  // onAction?: () => void;
}

/**
 * Internal state for {{WidgetName}} widget (if needed)
 */
export interface {{WidgetName}}State {
  // TODO: Add internal state fields
  isExpanded?: boolean;
  activeTab?: number;
}


// ============================================================================
// File: widgets/{{widgetName}}/model/index.ts
// Model public exports
// ============================================================================

export type { {{WidgetName}}Props, {{WidgetName}}State } from './types';


// ============================================================================
// File: widgets/{{widgetName}}/lib/utils.ts
// Widget-specific utilities
// ============================================================================

/**
 * Utility functions specific to {{WidgetName}} widget
 */

// TODO: Add widget-specific utility functions
// Example:
// export function format{{WidgetName}}Data(data: unknown) {
//   // ...
// }


// ============================================================================
// File: widgets/{{widgetName}}/lib/index.ts
// Lib public exports
// ============================================================================

export * from './utils';


// ============================================================================
// File: widgets/{{widgetName}}/ui/{{WidgetName}}.tsx
// Main widget component
// ============================================================================

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { {{WidgetName}}Props } from '../model';
// TODO: Import features and entities this widget uses
// Example:
// import { UserCard } from '@/entities/user';
// import { EditUserForm } from '@/features/edit-user';

/**
 * {{WidgetName}} widget
 *
 * A large, independent UI block that combines multiple features and entities.
 * Widgets are self-contained and can be used across different pages.
 *
 * @example
 * ```tsx
 * function HomePage() {
 *   return (
 *     <div>
 *       <{{WidgetName}} />
 *     </div>
 *   );
 * }
 * ```
 */
export function {{WidgetName}}({ className = '' }: {{WidgetName}}Props) {
  return (
    <div className={`{{widgetName}} ${className}`}>
      <ErrorBoundary fallback={<{{WidgetName}}ErrorFallback />}>
        <Suspense fallback={<{{WidgetName}}LoadingFallback />}>
          <{{WidgetName}}Content />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

/**
 * Internal content component with data fetching
 */
function {{WidgetName}}Content() {
  // TODO: Fetch data using queries from entities
  // Example:
  // const { data: user } = useUser(userId);

  // TODO: Use features for business logic
  // Example:
  // const { mutate: updateUser } = useUpdateUser();

  return (
    <div className="{{widgetName}}__content">
      <header className="{{widgetName}}__header">
        <h2>{{WidgetName}}</h2>
      </header>

      <main className="{{widgetName}}__main">
        {/* TODO: Compose features and entities */}
        {/* Example:
        <UserCard user={user} />
        <EditUserForm onSubmit={updateUser} />
        */}
        <p>{{WidgetName}} content goes here</p>
      </main>

      <footer className="{{widgetName}}__footer">
        {/* Footer content */}
      </footer>
    </div>
  );
}

/**
 * Loading fallback for widget
 */
function {{WidgetName}}LoadingFallback() {
  return (
    <div className="{{widgetName}}__loading">
      <div className="spinner" />
      <p>Loading {{WidgetName}}...</p>
    </div>
  );
}

/**
 * Error fallback for widget
 */
function {{WidgetName}}ErrorFallback() {
  return (
    <div className="{{widgetName}}__error">
      <h3>Error loading {{WidgetName}}</h3>
      <p>Something went wrong. Please try again later.</p>
    </div>
  );
}


// ============================================================================
// File: widgets/{{widgetName}}/ui/index.ts
// UI public exports
// ============================================================================

export { {{WidgetName}} } from './{{WidgetName}}';


// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Using widget in a page

import { {{WidgetName}} } from '@/widgets/{{widgetName}}';

function HomePage() {
  return (
    <div className="home-page">
      <{{WidgetName}} />
    </div>
  );
}

// ============================================================================

// Example 2: Widget with composition of features and entities

// widgets/user-profile/ui/UserProfile.tsx
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { userQueries, UserCard } from '@/entities/user';
import { useUpdateUser, EditUserForm } from '@/features/edit-user';
import { orderQueries, OrderList } from '@/entities/order';

export function UserProfile({ userId }: { userId: string }) {
  return (
    <div className="user-profile">
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<LoadingSpinner />}>
          <UserProfileContent userId={userId} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function UserProfileContent({ userId }: { userId: string }) {
  // Fetch user entity
  const { data: user } = useSuspenseQuery(userQueries.detail(userId));

  // Fetch user's orders
  const { data: orders } = useSuspenseQuery(
    orderQueries.byUser(userId)
  );

  // Use edit-user feature
  const { mutate: updateUser } = useUpdateUser();

  return (
    <div>
      <section className="user-info">
        <UserCard user={user} />
      </section>

      <section className="user-edit">
        <EditUserForm
          user={user}
          onSubmit={(data) => updateUser({ id: userId, data })}
        />
      </section>

      <section className="user-orders">
        <h3>Recent Orders</h3>
        <OrderList orders={orders} />
      </section>
    </div>
  );
}

// ============================================================================

// Example 3: Widget with internal state management

import { useState } from 'react';

export function TabbedWidget() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tabbed-widget">
      <nav className="tabs">
        <button onClick={() => setActiveTab(0)}>Tab 1</button>
        <button onClick={() => setActiveTab(1)}>Tab 2</button>
      </nav>

      <div className="tab-content">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            {activeTab === 0 && <Tab1Content />}
            {activeTab === 1 && <Tab2Content />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

// ============================================================================

// Example 4: Reusable widget with configuration

interface CarouselWidgetProps {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
}

export function CarouselWidget({
  items,
  renderItem,
  autoPlay = true,
  interval = 3000,
}: CarouselWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  return (
    <div className="carousel-widget">
      <div className="carousel-item">
        {renderItem(items[currentIndex])}
      </div>

      <div className="carousel-controls">
        <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}>
          Previous
        </button>
        <button onClick={() => setCurrentIndex((currentIndex + 1) % items.length)}>
          Next
        </button>
      </div>
    </div>
  );
}

// Usage:
function ProductPage() {
  const { data: products } = useSuspenseQuery(productQueries.featured());

  return (
    <CarouselWidget
      items={products}
      renderItem={(product) => <ProductCard product={product} />}
    />
  );
}

*/
