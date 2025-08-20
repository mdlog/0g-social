# Overview
0G Social is a fully decentralized, on-chain social media platform built on 0G Chain infrastructure, where users truly own their data and AI feeds. It features on-chain content storage, user-owned AI algorithms running on 0G Compute, transparent data availability on 0G DA, and verification on 0G Chain, eliminating corporate algorithm control. This project aims to shift the paradigm to truly decentralized, user-controlled social networking.

# User Preferences
Preferred communication style: Simple, everyday language.

# Recent Changes
- Replaced "AI Insights" with "Your Personal AI Feed" component featuring 0G Compute integration (2025-08-20)
- Set dark mode as default theme for first-time users (2025-08-20)
- Enhanced session debugging with wallet connection tracking and reset functionality
- Added "Reset" button in header for clearing stuck wallet session data
- Added comprehensive README.md documentation (2025-08-20)
- Fixed text sizing issues in profile cards and sidebar components for better layout
- Comprehensive database cleanup - retained only 10 fully verified posts with authentic blockchain hashes
- Resolved text overflow issues in "POSTS", "FOLLOWING", "FOLLOWERS" labels using truncate and smaller font sizes
- Fixed text sizing for all sidebar components: "Trending in 0G Community", "AI Insights", "Who to Follow", "Network Activity"
- Modern cyberpunk/sci-fi UI design implementation completed

# System Architecture

## Frontend Architecture
The client-side is a React and TypeScript application, using Vite. It follows a component-based design with `shadcn/ui` based on Radix UI primitives for UI components, Tailwind CSS for styling, TanStack Query for server state management, and Wouter for client-side routing. It includes a custom theme system supporting light/dark modes.

## Backend Architecture
The server uses Express.js with TypeScript in ES Module format. It features a RESTful API, an interface-based storage system (with in-memory for development), centralized error handling, and custom logging.

## Database Schema
The application uses PostgreSQL with Drizzle ORM for type-safe database interactions. The schema includes tables for Users, Posts, and Social Features (Follows, Likes, Comments), with automatic creation timestamps and Zod integration for schema validation.

## Authentication & Authorization
The system uses a simplified authentication with mock user sessions for development, user identification via API endpoints, and wallet address integration for Web3 identity.

## AI Integration
AI features are powered by OpenAI GPT-4o, providing content recommendations, trend analysis, and user insights. It handles graceful degradation when AI services are unavailable.

# External Dependencies

## Core Framework Dependencies
- **React 18**: Frontend framework.
- **Express.js**: Node.js web framework.
- **TypeScript**: Type safety across the stack.
- **Vite**: Build tool and development server.

## Database & ORM
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Type-safe database toolkit.
- **@neondatabase/serverless**: Serverless PostgreSQL driver.

## UI & Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Component library.
- **Radix UI**: Unstyled, accessible UI primitives.
- **Lucide React**: Icon library.

## State Management & Data Fetching
- **TanStack Query**: Server state management.
- **React Hook Form**: Form handling.
- **Zod**: Schema validation.

## AI & External Services
- **OpenAI API**: GPT-4o integration.
- **@0glabs/0g-ts-sdk**: Official 0G Storage TypeScript SDK for authentic 0G Storage infrastructure.
- **Custom Web3 Service**: Mock Web3 integration (ready for real implementation).

## Development & Build Tools
- **ESBuild**: Fast JavaScript bundler.
- **PostCSS**: CSS processing.
- **tsx**: TypeScript execution for development server.