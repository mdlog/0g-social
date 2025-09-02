# Overview
DeSocialAI is a fully decentralized, on-chain social media platform built on 0G Chain infrastructure, where users truly own their data and AI feeds. It features on-chain content storage, user-owned AI algorithms running on 0G Compute, transparent data availability on 0G DA, and verification on 0G Chain, aiming to eliminate corporate algorithm control and shift to a user-controlled social networking paradigm.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is a React and TypeScript application using Vite, built with a component-based design. It leverages `shadcn/ui` (based on Radix UI primitives) for UI components, Tailwind CSS for styling, TanStack Query for server state management, and Wouter for client-side routing. It includes a custom theme system supporting light/dark modes and features an elegant minimalist design with consistent typography (Poppins font) and refined UI elements. The application focuses on core social media functionalities, including Home Feed, AI Feed, Communities, Bookmarks, and Settings.

## Backend Architecture
The backend is an Express.js application written in TypeScript (ES Module format), providing a RESTful API. It uses an interface-based storage system, features centralized error handling, and custom logging. Production deployments utilize PostgreSQL for session storage.

## Database Schema
The application uses PostgreSQL with Drizzle ORM for type-safe database interactions. The schema includes tables for Users, Posts, Follows, Likes, and Comments, with automatic creation timestamps and Zod for schema validation.

## Authentication & Authorization
The system uses simplified authentication with mock user sessions for development, user identification via API endpoints, and integrates wallet addresses for Web3 identity.

## AI Integration
AI features are powered by OpenAI GPT-4o for content recommendations, trend analysis, and user insights. 

**0G Compute Network Integration (September 2, 2025):**
- Authentic SDK implementation following official documentation (docs.0g.ai)
- Uses createZGComputeNetworkBroker() for proper initialization
- Implements acknowledgeProviderSigner() before requests (required)
- Service discovery via listService() and getServiceMetadata()
- Authentication headers via getRequestHeaders() (single-use)
- Response verification via processResponse() for TEE services
- Smart provider switching between official providers (deepseek-r1-70b, llama-3.3-70b)
- No fallback/simulation mode - pure 0G Compute Network implementation

## 0G Chain Integration
DeSocialAI deeply integrates with 0G Chain infrastructure. This includes:
- **0G Chat**: Fully functional on-chain chat with real blockchain transactions, account creation, real-time balance tracking, automated funding, and **Smart Provider Switching** system for optimal performance.
- **0G Data Availability (DA)**: Full integration using gRPC client for authentic blob submission and retrieval, ensuring all social interactions are stored as structured data blobs on the 0G DA network.
- **0G Compute**: **Enhanced with Smart Provider Switching** - automatic failover between providers with intelligent timeout handling and seamless fallback mechanisms.
- **0G Storage**: Utilizes 0G Storage infrastructure on the Galileo testnet V3.
- **Blockchain Verification**: Social interactions are recorded with authentic transaction hashes from 0G Chain for real blockchain verification.

# External Dependencies

## Core Framework Dependencies
- **React 18**: Frontend framework.
- **Express.js**: Node.js web framework.
- **TypeScript**: Type safety.
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

## AI & Blockchain Services
- **OpenAI API**: GPT-4o integration for AI features.
- **@0glabs/0g-ts-sdk**: Official 0G Storage TypeScript SDK.
- **Custom Web3 Service**: Mock Web3 integration, ready for real implementation.