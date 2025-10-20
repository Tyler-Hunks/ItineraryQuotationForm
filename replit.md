# Travel Booking Form Application

## Overview

This is a full-stack web application featuring a comprehensive travel booking form that collects travel details and forwards them to n8n webhooks. The application is built with React and TypeScript on the frontend, Express.js on the backend, and uses shadcn/ui components for a modern, professional interface. The form captures travel dates, meal preferences, flight information, tour inclusions/exclusions, and document uploads, with real-time validation and user-friendly error handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side is built using React 18 with TypeScript and leverages modern React patterns including hooks and context. The application uses wouter for lightweight routing and React Hook Form with Zod validation for robust form handling. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing accessibility and consistent styling through Tailwind CSS.

Key frontend decisions:
- **Component Library**: Chose shadcn/ui for its combination of accessibility, customization flexibility, and modern design patterns
- **Routing**: Selected wouter over React Router for its minimal bundle size and simplicity
- **State Management**: Uses React Query (TanStack Query) for server state management, providing caching, synchronization, and error handling
- **Form Handling**: Implemented React Hook Form with Zod resolver for type-safe validation and better performance than controlled components

### Backend Architecture
The server is built with Express.js and follows a modular structure separating concerns into routes, storage, and server setup. The application uses TypeScript throughout for type safety and includes middleware for request logging and error handling.

Key backend decisions:
- **Framework**: Express.js chosen for its simplicity and extensive ecosystem
- **Data Validation**: Uses Zod schemas shared between client and server for consistent validation
- **Storage**: Implements an in-memory storage abstraction that can be easily extended to persistent databases
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Development Environment
The application uses Vite for fast development builds and hot module replacement. The build process includes TypeScript compilation for both client and server code, with separate optimization strategies for each.

Key development decisions:
- **Build Tool**: Vite selected for its fast cold starts and efficient hot reload
- **TypeScript Configuration**: Monorepo-style structure with shared types between client and server
- **CSS Framework**: Tailwind CSS with CSS custom properties for theming support

### Form Features
The travel booking form includes several sophisticated features:
- **Group Information**: Number of delegates and tour leaders (default 1 tour leader) with numeric validation
- **Hotel Selection**: Flexible textarea for hotel details including name, location, star rating, and nights
- **Pricing**: Tour fare and single supplement fields with decimal number support
- **Terms & Conditions**: Dynamic list with customizable templates supporting template variables (e.g., {{enter number}}, {{pick/enter date}})
- **Dynamic Lists**: Tour inclusions and exclusions with preset items and ability to add custom entries
- **File Upload**: Document upload with drag-and-drop support, 10MB file size limit (configurable), and type validation for PDF, DOCX, XLSX, and MD files
- **Date Handling**: Date picker with proper formatting and validation
- **Real-time Validation**: Form validation using Zod schemas with immediate feedback

## External Dependencies

### UI and Styling
- **shadcn/ui**: Complete UI component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible components for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library providing consistent iconography

### Form and Data Management
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **TanStack React Query**: Server state management with caching and synchronization

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking for JavaScript
- **ESBuild**: Fast JavaScript bundler for production builds

### Backend Dependencies
- **Express.js**: Web framework for Node.js
- **Drizzle ORM**: Type-safe SQL ORM (configured for PostgreSQL)
- **Neon Database**: Serverless PostgreSQL database provider

### Integration Services
- **n8n Webhooks**: External workflow automation platform for processing form submissions
- **Environment Variables**: Support for webhook URLs and database connections through environment configuration

The application is designed to be easily deployable with minimal configuration, requiring only database and webhook environment variables to be set.