# FormFlow - Form Builder Application

## Overview

FormFlow is a full-stack form builder application that allows users to create, manage, and collect responses from custom forms. The platform supports multiple output formats (Excel, Word, PDF, WhatsApp sharing), private user access controls, and includes an admin dashboard for user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state, React Context for auth and form state
- **Styling**: Tailwind CSS with shadcn/ui components (New York style)
- **Theme Support**: next-themes for dark/light mode switching
- **UI Components**: Radix UI primitives with custom styling via class-variance-authority

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Build Tool**: esbuild for production bundling, tsx for development
- **API Design**: RESTful endpoints under `/api/*` prefix

### Data Storage
- **Primary Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Alternative Storage**: MongoDB adapter available (mongo-storage.ts) for flexible deployment
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

### Authentication & Authorization
- **User Auth**: Custom email/password authentication with bcrypt hashing
- **Session Management**: Express sessions stored in database
- **User Types**: 
  - Regular users (form creators)
  - Private users (restricted form access)
  - Admin users (system management)
- **Account Status**: Support for active/suspended user states

### Key Design Patterns
- **Shared Schema**: Database schema defined in `/shared/schema.ts` using Drizzle, shared between client and server
- **Storage Interface**: Abstract storage interface (`IStorage`) allowing swappable database implementations
- **Context Providers**: AuthContext and FormContext for centralized state management
- **Protected Routes**: Client-side route guards for authenticated and admin routes

### Document Generation
- **Excel**: xlsx library for spreadsheet generation
- **Word Documents**: docx library for .docx creation
- **PDF**: jsPDF for PDF generation
- **WhatsApp**: Custom message formatting for share links

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL (`@neondatabase/serverless`)
- **Connection**: Requires `DATABASE_URL` environment variable

### Frontend Libraries
- **Charts**: Recharts for analytics visualizations
- **Animations**: Framer Motion for UI transitions
- **Date Handling**: date-fns for date formatting
- **Form Validation**: Zod with react-hook-form integration

### Development Tools
- **Replit Plugins**: 
  - vite-plugin-runtime-error-modal for error display
  - vite-plugin-cartographer for code mapping
  - vite-plugin-dev-banner for development indicators
- **Custom Plugin**: meta-images plugin for OpenGraph image handling