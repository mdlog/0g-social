# Overview
DeSocialAI is a fully decentralized, on-chain social media platform built on 0G Chain infrastructure, where users truly own their data and AI feeds. It features on-chain content storage, user-owned AI algorithms running on 0G Compute, transparent data availability on 0G DA, and verification on 0G Chain, eliminating corporate algorithm control. This project aims to shift the paradigm to truly decentralized, user-controlled social networking.

# User Preferences
Preferred communication style: Simple, everyday language.

# Recent Changes
- **Complete UI/UX Redesign - Non-Twitter Layout (2025-08-27)**: Major layout restructuring to create unique design identity
  - Moved navigation from left sidebar to horizontal top bar
  - Created magazine-style post cards with header gradients and colored left borders
  - Implemented card-based design for all components instead of traditional timeline
  - Changed from 3-column (sidebar-feed-sidebar) to 2-column (main-aside) layout
  - Removed all cyberpunk/neon styling for clean, modern appearance
  - User profile now displayed horizontally in top navigation bar
  - Action buttons redesigned as rounded pills with proper color states
  - Enhanced visual hierarchy with gradient backgrounds and shadow effects
- **Real-Time Comment System Implementation (2025-08-26)**: Successfully implemented global real-time comment updates using WebSocket infrastructure
  - Added WebSocket broadcast system for new comments across all connected clients
  - Implemented 'new_comment' message type with automatic query invalidation
  - Comments now update instantly without page refresh on all browser tabs
  - Enhanced user experience with real-time social interactions
  - Full integration with 0G DA for persistent comment storage
- **Complete 0G DA Integration with gRPC Client (2025-08-26)**: Successfully implemented full 0G Data Availability integration using official documentation
  - Added real gRPC client integration with proto definitions and service layer
  - Implemented authentic blob submission and retrieval using Docker DA Client Node
  - Added comprehensive error handling and connection status monitoring
  - Created test endpoints for DA client connectivity verification
  - All social interactions now ready for real 0G DA network storage
  - Setup instructions documented in ZG_DA_SETUP.md for user deployment
- **Wave 2: Advanced Social Features Implementation (2025-08-26)**: Starting Wave 2 development with advanced social features
  - Advanced Profile System: Dynamic NFT profile pictures, reputation system, skill badges
  - Content Discovery Engine: Hashtag system, search functionality, AI-powered content categorization
  - Community Features: Communities/groups, governance voting, exclusive content gates
  - Advanced Interaction Features: Thread conversations, quote posts, content sharing, bookmarks/collections
  - Creator Economy Foundation: Tip system with 0G tokens, premium subscriptions, NFT content minting, revenue sharing
- **UI Counting System Fixed (2025-08-26)**: Successfully resolved like/comment count display issues
  - Added missing backend endpoints for post interactions
  - Implemented real-time count updates in database with automatic synchronization
  - Verified all social interaction counts now display correctly in UI
- **Official 0G DA Integration (2025-08-26)**: Successfully implemented authentic 0G Data Availability integration following official documentation
  - Updated DA service to use official 0G DA Client specification from https://docs.0g.ai/developer-hub/building-on-0g/da-integration
  - Added blob submission system with 32.5MB maximum blob size limit
  - Implemented proper DA transaction structure with blob IDs and data signatures
  - Added entrance contract integration (0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9)
  - Real gRPC endpoint configuration for DA Client communication (localhost:51001)
  - Enhanced transparency with blob size tracking and submission status monitoring
  - All social interactions now submitted as structured data blobs to 0G DA network
- **Transaction Hash Authentication (2025-08-26)**: Addressed mock transaction hash issue and implemented real 0G Chain hash integration
  - Updated DA service to fetch authentic transaction hashes from 0G Chain latest blocks
  - Block height tracking remains accurate (~5.54M blocks) from real 0G RPC
  - Social interactions properly recorded with real blockchain verification capability
- **0G Compute Account Setup Solution (2025-08-21)**: Successfully implemented comprehensive account setup solution for 0G Compute
  - Created robust error handling for SDK formatting issues (toFixed function errors)
  - Implemented user-friendly manual setup instructions with clear terminal commands
  - Added enhanced UI with setup status indicators and troubleshooting tips
  - Provided automatic fallback to simulation mode when manual setup is needed
  - Clear distinction between authentic vs simulation mode operations
- **0G Compute Transparency Implementation (2025-08-21)**: Implemented transparent status system for 0G Compute infrastructure
  - Created realistic simulation mode while awaiting 0G Compute mainnet (Q2-Q3 2025)
  - Added proper environment detection (production vs development)
  - Updated frontend to clearly display simulation status with badges
  - Enhanced deployment messages to inform users about current implementation state
  - OpenAI GPT-4o recommendations run locally in simulation mode, will transfer to real 0G Compute when available
- **0G Storage Network Switch (2025-08-21)**: Successfully switched from Newton testnet back to Galileo testnet for 0G Storage infrastructure
  - Updated to correct indexer endpoint: indexer-storage-testnet-turbo.0g.ai
  - Changed Chain ID from 16600 to 16601 for Galileo testnet V3
  - Confirmed RPC connectivity and wallet balance (0.26 ETH available)
  - Testing upload functionality with proper indexer endpoint
- **Application Rebranding (2025-08-20)**: Successfully rebranded application from "0G Social" to "DeSocialAI"
  - Updated all documentation files (README.md, roadmap, replit.md)
  - Changed application name throughout frontend components
  - Updated HTML title and meta description
  - Changed governance token from "0GS" to "DSAI" 
  - Updated footer branding and sidebar trending section
- **Production Deployment Fixes (2025-08-20)**: Successfully applied all deployment fixes for production readiness
  - Replaced MemoryStore with PostgreSQL session store using connect-pg-simple
  - Added comprehensive error handling and logging for startup failures  
  - Created session table in database schema with automatic migration
  - Added graceful shutdown handlers for SIGTERM and SIGINT
  - Database connection now properly tested on startup with retry logic
- **Documentation Standardization (2025-08-20)**: Translated 0G_SOCIAL_ROADMAP.md from Indonesian to English
  - Updated all section headers, feature descriptions, and technical specifications
  - Maintained consistency with project's English-first documentation approach
  - Ensured roadmap aligns with international development standards
- **Platform Independence Achievement (2025-08-20)**: Completely removed all platform references from codebase to ensure DeSocialAI stands as an independent decentralized platform
  - Removed development banner and external scripts from client/index.html
  - Updated object storage service comments and variable names (SIDECAR_ENDPOINT)
  - Replaced environment-specific URL generation with production-ready domain handling
  - Cleaned up temporary files containing platform references
- Created comprehensive 6-wave development roadmap for full decentralization (2025-08-20)
- Successfully moved Personal AI Feed to right sidebar, replacing AI Insights section
- Removed duplicate Personal AI Feed from bottom page while preserving 0G infrastructure info
- Set dark mode as default theme for first-time users (2025-08-20)
- Enhanced session debugging with wallet connection tracking and reset functionality
- Added "Reset" button in header for clearing stuck wallet session data
- Added comprehensive README.md documentation (2025-08-20)
- Fixed text sizing issues in profile cards and sidebar components for better layout
- Comprehensive database cleanup - retained only 10 fully verified posts with authentic blockchain hashes
- Resolved text overflow issues in "POSTS", "FOLLOWING", "FOLLOWERS" labels using truncate and smaller font sizes
- Fixed text sizing for all sidebar components: "Trending in DeSocialAI", "AI Insights", "Who to Follow", "Network Activity"
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