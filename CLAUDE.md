# Najem v3 Development Guide

## Commands
- **Development**: `npm run dev` - Start Next.js dev server with Turbopack
- **Build**: `npm run build` - Build production bundle
- **Start**: `npm run start` - Run production server
- **Lint**: `npm run lint` - Run ESLint checks
- **Combined build+start**: `npm run go` - Build and start production server

## Code Style Guidelines
- **File Naming**: Components: PascalCase.tsx, Hooks: camelCase.ts, Utils: kebab-case.ts
- **Component Structure**: Server components for data fetching, Client components for interactivity
- **Server/Client Directive**: Add 'use client' at top of client components
- **Types**: Use explicit TypeScript typing and Zod for validations
- **State Management**: React Query for server state, Zustand for global UI state, Context for feature-specific state
- **Error Handling**: Use consistent response format {success, data, error} and proper error boundaries
- **Component Size**: Keep components under 300 lines, follow single responsibility principle
- **Imports**: Group imports by external libs, internal components, and types/utils
- **Performance**: Use proper memoization (React.memo, useMemo, useCallback) for expensive operations