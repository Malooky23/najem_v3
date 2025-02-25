# Najem v3 - Inventory Management System

### Architecture

The project follows a layered architecture with:

- **UI Layer**: React components using shadcn/ui component library
- **Data Access Layer**: Server actions and API routes
- **Business Logic Layer**: Services for domain operations
- **Data Layer**: PostgreSQL database with Drizzle ORM

### Core Features Implemented

1. **Authentication**
   - NextAuth integration for user authentication
   - Role-based access control (EMPLOYEE, CUSTOMER, DEMO)
   - Login/logout functionality

2. **Customer Management**
   - Support for business and individual customers
   - Contact details and address management
   - Customer-specific item associations

3. **Inventory System**
   - Item creation and management
   - Stock tracking
   - Movement history (IN/OUT operations)

4. **Order Processing**
   - Order creation workflow
   - Status tracking
   - Movement types (IN/OUT)

### Database Design

The database schema includes:
- User management tables
- Customer-related tables (business/individual customers)
- Inventory tables (items, stock movements)
- Order processing tables

SQL functions and triggers have been implemented for complex operations like:
- Customer creation
- User authentication
- Stock movement tracking
- Automatic timestamps

## Technical Implementation

### Frontend

- **UI Framework**: Next.js App Router with React Server Components
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Fetching**: TanStack Query for client-side state management
- **Form Handling**: React Hook Form with Zod validation

### Backend

- **API**: Server Actions and API Routes
- **Database Access**: Drizzle ORM for type-safe database operations
- **Authentication**: NextAuth.js integration
- **Validation**: Zod schemas for type safety

## Recommendations for Improvement

### 1. Architecture & Code Organization

- **Consolidate Data Access Layer**:
  - Create a centralized service layer to handle all database operations
  - Standardize error handling across services
  - Implement proper dependency injection patterns

- **API Consistency**:
  - Standardize response formats across all endpoints
  - Consider implementing a consistent API pattern (REST or GraphQL)
  - Add comprehensive API documentation

- **Type Safety**:
  - Complete Zod schemas for all data entities
  - Ensure end-to-end type safety from database to UI

### 2. Feature Implementation

- **Inventory Management**:
  - Implement stock movement validation
  - Add batch stock updates
  - Create a stock alerts system
  - Develop stock history visualization

- **Order System**:
  - Complete the order fulfillment workflow
  - Implement order status transitions
  - Add order notifications
  - Develop order tracking features

- **Reporting**:
  - Implement inventory reports
  - Add financial reporting capabilities
  - Create customer activity reports
  - Add export functionality for reports

### 3. User Experience

- **Mobile Responsiveness**:
  - Ensure all interfaces work well on mobile devices
  - Implement responsive design patterns for complex tables

- **UI Enhancements**:
  - Add dark mode support
  - Implement better loading states
  - Add bulk actions for items/orders

- **Performance Optimization**:
  - Implement pagination for large datasets
  - Add caching strategies
  - Optimize database queries

### 4. Testing & Quality Assurance

- **Unit Testing**:
  - Add Jest/Vitest for unit testing
  - Implement testing for critical business logic

- **Integration Testing**:
  - Add Playwright/Cypress for E2E testing
  - Test critical user flows

- **Code Quality**:
  - Implement ESLint rules for consistent code style
  - Add more comprehensive TypeScript configurations
  - Consider adding pre-commit hooks

### 5. DevOps & Deployment

- **CI/CD Pipeline**:
  - Set up GitHub Actions for automated testing and deployment
  - Implement staging and production environments

- **Monitoring**:
  - Add error tracking (Sentry)
  - Implement logging system
  - Add performance monitoring

## Next Steps

1. **Short-term (1-2 weeks)**:
   - Complete high-priority inventory management features
   - Finish order fulfillment workflow
   - Add comprehensive error handling

2. **Mid-term (1-2 months)**:
   - Implement reporting system
   - Add user interface improvements
   - Set up comprehensive testing

3. **Long-term (3+ months)**:
   - Develop customer portal
   - Implement advanced analytics
   - Add third-party integrations

## Project Structure

The current project structure follows Next.js App Router conventions:

src/ 
├── app/ # Next.js app router pages 
│ 
├── (pages)/ # Protected routes 
│ 
└── api/ # API routes 
├── components/ # Reusable UI components 
├── hooks/ # Custom React hooks 
├── lib/ # Utility functions and configurations 
├── server/
│ 
├── actions/ # Server actions 
│ 
├── db/ # Database schema and configuration 
│ 
├── drizzle/ # Drizzle ORM migrations 
│ 
└── services/ # Business logic services 
└── types/ # TypeScript type definitions



# Najem v3

## Project Structure

### Core Technologies
- Next.js (App Router)
- TypeScript
- PostgreSQL with Drizzle ORM
- Zod for validation
- TanStack Query for data fetching
- NextAuth for authentication
- Tailwind CSS for styling

### Directory Structure
src
├── app/                    # Next.js app router pages
│   ├── (pages)/           # Protected routes
│   └── api/               # API routes
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── server/ │   ├── actions/          # Server actions
│   ├── db/               # Database schema and configuration
│   ├── drizzle/          # Drizzle ORM migrations
│   └── services/         # Business logic services
└── types/                # TypeScript type definitions

# Project Analysis

## Data Fetching Procedures

### Server Actions
Located in <mcfolder name="actions" path="/Users/malek/local_projects/najem_v3/src/server/actions"></mcfolder>:
- `createItem.ts` - Item creation
- `orders.ts` - Order management
- `customers/actions.ts` - Customer management

### Services Layer
Located in <mcfolder name="services" path="/Users/malek/local_projects/najem_v3/src/server/services"></mcfolder>:
- `items-services.ts` - Item-related queries
- Database interactions using Drizzle ORM

### API Routes
Located in <mcfolder name="api" path="/Users/malek/local_projects/najem_v3/src/app/api"></mcfolder>:
- `/items/new/route.ts` - Item creation endpoint
- TanStack Query integration for client-side data fetching

## Type Definitions and Validations

### Core Types
Located in <mcfolder name="types" path="/Users/malek/local_projects/najem_v3/src/types"></mcfolder>:
- `items.ts` - Item-related schemas and types
- Zod schemas for validation

### Database Schema
Located in <mcfile name="schema.ts" path="/Users/malek/local_projects/najem_v3/src/server/db/schema.ts"></mcfile>:
- Database table definitions
- Relationships between entities

## Suggested Improvements

### 1. Data Fetching Consolidation
- Create a centralized service layer:
```typescript:%2FUsers%2Fmalek%2Flocal_projects%2Fnajem_v3%2Fsrc%2Fserver%2Fservices%2Findex.ts
export * from './items-service';
export * from './orders-service';
export * from './customers-service';

### Key Features Implementation

#### Authentication
- Uses NextAuth for user authentication
- Supports multiple user types (EMPLOYEE, CUSTOMER, DEMO)
- Role-based access control

#### Database Layer
- PostgreSQL with Drizzle ORM
- Structured schema with relations
- Inventory tracking system
- Customer management
- Order processing

#### API Architecture
- Server Actions for data mutations
- API routes for specific endpoints
- Zod validation for type safety

#### Frontend
- React Server Components
- Client-side components where needed
- TanStack Query for data management
- Shadcn UI components

## Current Implementation

### Core Features
1. User Authentication
   - Login/Logout functionality
   - Role-based access control
   - Session management

2. Customer Management
   - Business and Individual customers
   - Contact details and addresses
   - Customer-specific items

3. Inventory System
   - Item creation and management
   - Stock tracking
   - Movement history
   - Stock reconciliation

4. Order Processing
   - Order creation
   - Status tracking
   - Movement types (IN/OUT)
   - Delivery methods

## To-Do List

### High Priority
1. Inventory Management
   - [ ] Implement stock movement validation
   - [ ] Add batch stock updates
   - [ ] Implement stock alerts system
   - [ ] Add stock history visualization

2. Order System
   - [ ] Complete order fulfillment workflow
   - [ ] Add order status transitions
   - [ ] Implement order notifications
   - [ ] Add order tracking features



### Medium Priority
1. Reporting
   - [ ] Implement inventory reports
   - [ ] Add financial reporting
   - [ ] Create customer activity reports
   - [ ] Add export functionality

2. User Interface
   - [ ] Improve mobile responsiveness
   - [ ] Add dark mode support
   - [ ] Implement better loading states
   - [ ] Add bulk actions for items/orders

### Low Priority
1. System Improvements
   - [ ] Add system-wide search
   - [ ] Implement audit logging
   - [ ] Add backup/restore functionality
   - [ ] Implement caching strategy

2. Integration
   - [ ] Add API documentation
   - [ ] Implement webhook system
   - [ ] Add third-party integration support

3. Customer Features
   - [ ] Add customer portal
   - [ ] Add customer activity history
   - [ ] Implement customer document management

## Contributing
[Add contribution guidelines here]

## License
[Add license information here]