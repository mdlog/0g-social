# Overview

0G Social is a decentralized social media platform built with modern web technologies. The application combines React frontend with Express.js backend, featuring AI-powered content recommendations, decentralized identity verification, and Web3 integration. The platform focuses on providing a Twitter-like social experience enhanced with blockchain features and AI-driven personalization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built with React and TypeScript, utilizing Vite as the build tool. The architecture follows a component-based design with:

- **UI Components**: Comprehensive design system based on shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom theme provider supporting light/dark modes with localStorage persistence

The frontend is organized into logical directories:
- `/components`: Reusable UI components and layout components
- `/pages`: Route-specific page components
- `/hooks`: Custom React hooks for shared logic
- `/lib`: Utility functions and configuration

## Backend Architecture

The server uses Express.js with TypeScript in ES Module format. Key architectural decisions include:

- **API Design**: RESTful API structure with organized route handlers
- **Storage Layer**: Interface-based storage system with in-memory implementation for development
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Logging**: Custom request/response logging for API endpoints
- **Development Setup**: Vite integration for hot reloading in development mode

The backend structure separates concerns:
- `/routes.ts`: API endpoint definitions and handlers
- `/storage.ts`: Data access layer with interface abstraction
- `/services`: Business logic and external service integrations
- `/vite.ts`: Development server configuration

## Database Schema

The application uses PostgreSQL with Drizzle ORM for type-safe database interactions. The schema includes:

- **Users**: Profile information, verification status, follower/following counts
- **Posts**: Content, engagement metrics, AI recommendation flags
- **Social Features**: Follows, likes, comments with proper foreign key relationships
- **Timestamps**: Automatic creation timestamps for all entities

Drizzle provides schema validation through Zod integration, ensuring type safety from database to API responses.

## Authentication & Authorization

The current implementation uses a simplified authentication system with:
- Mock user sessions for development
- User identification through API endpoints
- Wallet address integration for Web3 identity
- Decentralized identity verification badges

## AI Integration

AI features are powered by OpenAI GPT-4o integration:
- **Content Recommendations**: Personalized feed curation based on user behavior
- **Trend Analysis**: AI-generated insights about platform activity
- **User Insights**: Engagement analysis and recommendations
- **Fallback Handling**: Graceful degradation when AI services are unavailable

The AI service uses structured JSON responses and implements proper error handling for reliable operation.

# External Dependencies

## Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Node.js web framework for API server
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Build tool and development server with fast HMR

## Database & ORM
- **PostgreSQL**: Primary database (configured via Drizzle but can be provisioned separately)
- **Drizzle ORM**: Type-safe database toolkit with schema validation
- **@neondatabase/serverless**: Serverless PostgreSQL driver for cloud deployment

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **shadcn/ui**: High-quality component library built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Icon library with consistent design

## State Management & Data Fetching
- **TanStack Query**: Server state management with caching and background updates
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for API requests and responses

## AI & External Services
- **OpenAI API**: GPT-4o integration for content recommendations and insights
- **Custom Web3 Service**: Mock Web3 integration for wallet connectivity (ready for real implementation)

## Development & Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **tsx**: TypeScript execution for development server

The application is designed to be easily deployed on cloud platforms with environment variable configuration for database connections and API keys.