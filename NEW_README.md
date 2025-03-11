# Najem v3 Project Refactoring Plan

## Current Issues

1. **Inconsistent File Structure**:
   - Mixed naming conventions (kebab-case, PascalCase, underscore prefixes)
   - Inconsistent folder nesting depth
   - Lack of clear organizational patterns

2. **Component Organization**:
   - Overly large components with mixed responsibilities
   - Inconsistent patterns for table, form, and detail views
   - Deep nesting of components making navigation difficult

3. **State Management**:
   - Mixed approaches (Zustand, URL state, React Query)
   - Duplicated state logic
   - Performance issues from unnecessary re-renders

4. **Code Duplication**:
   - Multiple table implementations
   - Duplicated validation logic
   - Similar UI patterns implemented differently

5. **Project Organization**:
   - Unclear boundaries between features
   - Inconsistent import patterns
   - Mixed server/client code

## Refactoring Approach

### 1. Standardized File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth-related routes
│   ├── (marketing)/        # Public marketing pages
│   └── (dashboard)/        # Protected dashboard routes
│       ├── customers/      # Customer management feature
│       ├── warehouse/      # Warehouse management feature
│       │   ├── items/      # Items management
│       │   ├── orders/     # Orders management
│       │   └── movements/  # Stock movements (renamed from tx)
│       └── settings/       # User settings
├── components/             # Shared components
│   ├── ui/                 # Base UI components
│   ├── forms/              # Form-related components
│   ├── layout/             # Layout components
│   └── features/           # Shared feature components
├── hooks/                  # Custom React hooks
│   ├── form/               # Form-related hooks
│   ├── data/               # Data fetching hooks
│   ├── ui/                 # UI-related hooks
│   └── auth/               # Auth-related hooks
├── lib/                    # Utility functions & configs
│   ├── auth/               # Auth utilities
│   ├── utils/              # General utilities
│   ├── validations/        # Zod schemas & validators
│   └── constants/          # Application constants
├── server/                 # Server-side code
│   ├── actions/            # Server actions
│   ├── api/                # API route handlers
│   ├── db/                 # Database schema & queries
│   └── services/           # Business logic services
├── stores/                 # Client-state management
└── types/                  # TypeScript type definitions
```

### 2. Component Organization Standard

Each feature should follow this pattern:

```
feature/
├── page.tsx                # Main page component (server)
├── actions.ts              # Feature-specific server actions
├── types.ts                # Feature-specific types
├── components/             # Feature components
│   ├── FeatureClient.tsx   # Client entry point
│   ├── FeatureProvider.tsx # Context provider
│   ├── FeatureList.tsx     # List view
│   ├── FeatureDetail.tsx   # Detail view
│   ├── FeatureForm.tsx     # Form component
│   └── feature-columns.ts  # Table columns
└── hooks/                  # Feature-specific hooks
    ├── useFeatureForm.ts   # Form logic
    ├── useFeatureData.ts   # Data fetching
    └── useFeatureState.ts  # State management
```

### 3. Naming Conventions

- **Files**:
  - Components: PascalCase.tsx (ItemCard.tsx)
  - Hooks: camelCase.ts (useOrderForm.ts)
  - Utilities: kebab-case.ts (date-utils.ts)
  - Constants: SCREAMING_SNAKE_CASE.ts (ORDER_STATUSES.ts)

- **Components**:
  - Client wrappers: ComponentNameClient
  - Context providers: ComponentNameProvider
  - Pages: Feature-related name (OrdersPage)

- **Functions & Variables**:
  - Functions: camelCase (fetchOrderData)
  - Component props: ComponentNameProps
  - Context: FeatureNameContext

### 4. State Management Standards

- Use Zustand for global UI state
- Use React Query for server state with standardized patterns
- Context for feature-specific shared state
- URL state only for shareable/bookmarkable state

### 5. Implementation Steps

1. **Phase 1: Structure Standardization**
   - Reorganize directory structure
   - Rename files for consistency
   - Create proper abstraction layers

2. **Phase 2: Component Refactoring**
   - Break down large components
   - Implement standard patterns for tables and forms
   - Improve component composition

3. **Phase 3: State Management Refactoring**
   - Standardize state management
   - Implement context where needed
   - Optimize for performance

4. **Phase 4: Server/Client Optimization**
   - Proper use of Server Components
   - Implement streaming and Suspense
   - Optimize data loading patterns

5. **Phase 5: Documentation & Testing**
   - Document patterns and standards
   - Add proper error boundaries and loading states
   - Implement testing strategy

## Implementation Priority

1. Highest impact features first (orders, customers)
2. Common UI components standardization
3. Hooks and utilities reorganization
4. Server components migration
5. State management optimization

## Benefits

- Improved code maintainability and readability
- Better performance through optimized rendering
- Easier onboarding for new developers
- More consistent user experience
- Better separation of concerns
- Reduced bundle size
- More predictable data flow