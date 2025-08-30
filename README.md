# DeSocialAI

A fully decentralized, on-chain social media platform built on 0G Chain infrastructure, where users truly own their data and AI feeds. Experience the future of social networking with complete data ownership and user-controlled algorithms.

## Overview

DeSocialAI represents the next generation of social networking - a platform where users maintain complete control over their data, content, and algorithms. Built on the cutting-edge 0G blockchain infrastructure, it eliminates corporate algorithm control and delivers true decentralization with elegant, modern design.

### Key Features

- **True Data Ownership**: All content stored on 0G Storage with cryptographic verification
- **User-Controlled AI**: Personal AI algorithms running on 0G Compute
- **Transparent Operations**: All interactions recorded on 0G DA (Data Availability)
- **Blockchain Verification**: Complete transaction verification on 0G Chain
- **RainbowKit Integration**: Modern wallet connection with multi-wallet support
- **Real-time Updates**: Live blockchain and network activity with WebSocket connections
- **Elegant Design**: Modern minimalist interface with DM Sans typography and glass effects
- **Media Upload System**: Secure file uploads with multer and object storage integration
- **Real-time Comments**: Live comment system with WebSocket broadcasting
- **Simplified Navigation**: Streamlined interface focusing on core social features

## Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components based on Radix UI primitives
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing

### Backend
- **Express.js** with TypeScript in ES Module format
- **PostgreSQL** with Drizzle ORM for type-safe database interactions
- **RESTful API** design with centralized error handling
- **Interface-based storage** system for scalability

### Blockchain Integration
- **0G Chain Galileo Testnet** for transaction verification (Chain ID: 16601)
- **0G Storage Network** for decentralized content storage with indexer connectivity
- **0G DA Client** with gRPC integration for transparent data availability
- **0G Compute Network** for user-owned AI algorithm execution
- **RainbowKit + Wagmi** for advanced wallet connection and multi-wallet support
- **Real-time Block Monitoring** with current block height tracking (~5.7M blocks)

### AI Features
- **OpenAI GPT-5** integration for advanced content recommendations
- **Real-time trend analysis** with AI-powered insights
- **Personalized feed algorithms** with user preference learning
- **0G Compute simulation mode** for development with production readiness
- **Graceful degradation** when AI services are unavailable

## Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- Modern browser with Web3 wallet support (MetaMask, WalletConnect, etc.)
- 0G Chain Galileo Testnet access
- OpenAI API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd desocialai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with the following variables:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/desocialai
   OPENAI_API_KEY=your_openai_api_key
   COMBINED_SERVER_PRIVATE_KEY=your_0g_private_key
   COMBINED_SERVER_CHAIN_RPC=https://evmrpc-testnet.0g.ai
   ENTRANCE_CONTRACT_ADDR=0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9
   GRPC_SERVER_PORT=51001
   SESSION_SECRET=your_session_secret
   ```

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` and connect your Web3 wallet using RainbowKit

## Usage

### Connecting Your Wallet

1. Click "Connect Wallet" on the landing page
2. Choose your preferred wallet from RainbowKit modal (MetaMask, WalletConnect, etc.)
3. Approve the wallet connection request
4. Sign the verification message to authenticate your identity
5. You'll be redirected to your personalized feed with real-time updates

### Creating Posts

1. Use the elegant post composer in the main feed
2. Add your content (text, images, or media files up to 10MB)
3. Upload media files using the integrated upload system with multer
4. Sign the transaction with your connected wallet
5. Your post will be stored on 0G Storage and verified on-chain
6. Real-time updates via WebSocket will notify all connected users

### Blockchain Verification

All posts include:
- **Storage Hash**: Cryptographic proof of content on 0G Storage
- **Transaction Hash**: On-chain verification record
- **Block Height**: Blockchain confirmation details
- **Verification Status**: Real-time validation indicators

### File Uploads

The platform supports secure file uploads through:
- **Multer Integration**: Memory storage with 10MB file size limit
- **Object Storage Service**: Files stored on Google Cloud Storage infrastructure
- **ACL Policies**: Granular access control for user content
- **Real-time Processing**: Immediate file validation and error handling
- **Media Support**: Images, videos, and documents with type validation

## Development

### Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility libraries
├── server/                 # Express.js backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database storage interface
│   └── services/           # Business logic services
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema definitions
└── docs/                   # Documentation
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

### Database Schema

The application uses a carefully designed PostgreSQL schema:

- **Users**: Wallet-based user profiles with avatar support and social metrics
- **Posts**: Content with blockchain verification hashes and engagement counts
- **Follows**: Social graph relationships for user connections
- **Likes**: User engagement tracking with real-time updates
- **Comments**: Threaded discussions with real-time WebSocket broadcasting
- **Communities**: Group-based content organization (planned)
- **Bookmarks**: Personal content collections (planned)

### API Endpoints

#### Authentication
- `GET /api/users/me` - Get current user profile with avatar
- `POST /api/web3/connect` - Connect Web3 wallet via RainbowKit
- `POST /api/web3/disconnect` - Disconnect wallet and clear session
- `POST /api/web3/verify` - Verify wallet signature for authentication

#### Content
- `GET /api/posts/feed` - Get personalized post feed with pagination
- `POST /api/posts` - Create new post with media upload support
- `POST /api/posts/upload-media` - Upload media files with multer
- `POST /api/posts/:id/like` - Like/unlike post with real-time updates
- `POST /api/posts/:id/comments` - Add comments with WebSocket broadcasting
- `POST /api/users/:id/follow` - Follow/unfollow user

#### Blockchain
- `GET /api/web3/status` - Get blockchain connection status with real-time block height
- `GET /api/zg/storage/stats` - Get 0G Storage network statistics
- `GET /api/zg/da/stats` - Get 0G DA network statistics with transaction counts
- `GET /api/zg/compute/stats` - Get 0G Compute network statistics
- `GET /api/zg/compute/status` - Get compute service configuration status

#### AI & Analytics
- `GET /api/ai/insights` - Get personalized AI insights
- `GET /api/ai/trending` - Get trending topics analysis
- `GET /api/stats` - Get platform statistics

## Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   Ensure all environment variables are configured for production

3. **Deploy to your hosting platform**
   The application is ready for deployment on any Node.js hosting service

### Environment Configuration

For production, ensure these additional variables are set:
- `NODE_ENV=production`
- `DATABASE_URL` (production database)
- `OPENAI_API_KEY` (production API key)
- All 0G Chain production endpoints

## Current Status (August 2025)

**✅ Production Ready Features:**
- Elegant modern UI with DM Sans typography and glass effects
- Complete 0G Chain integration (Galileo Testnet, Chain ID: 16601)
- RainbowKit wallet connection with multi-wallet support
- Real-time WebSocket updates for posts and comments
- Secure media upload system with multer integration
- PostgreSQL database with optimized schema
- OpenAI GPT-5 integration for AI recommendations

**🔄 In Development:**
- 0G Compute mainnet integration (expected Q2-Q3 2025)
- Advanced community features and governance
- NFT integration for profile pictures and content
- Enhanced AI personalization algorithms

## Contributing

We welcome contributions to DeSocialAI! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Submit a pull request**

### Code Style

- Use TypeScript for type safety
- Follow the existing component patterns
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Add comments for complex blockchain interactions

## Technology Stack

### Core Technologies
- **React 18** - Frontend framework
- **TypeScript** - Type safety across the stack
- **Express.js** - Backend web framework
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe database toolkit

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library

### Blockchain & Web3
- **0G Chain Galileo Testnet** - Layer 1 blockchain for verification (Chain ID: 16601)
- **0G Storage Network** - Decentralized storage with indexer connectivity
- **0G DA Client** - Data availability layer with gRPC integration
- **0G Compute Network** - Decentralized computing platform
- **RainbowKit** - Modern wallet connection interface
- **Wagmi** - React hooks for Ethereum interaction
- **Viem** - TypeScript interface for Ethereum

### AI & Analytics
- **OpenAI GPT-5** - Latest language model integration (August 2025)
- **Real-time Analytics** - Live network statistics and user metrics
- **AI Trend Analysis** - Advanced content insights and recommendations
- **WebSocket Updates** - Real-time data streaming for live statistics

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **0G Chain Documentation**: [https://docs.0g.ai/](https://docs.0g.ai/)
- **0G Storage Guide**: [https://docs.0g.ai/0g-storage](https://docs.0g.ai/0g-storage)
- **0G DA Documentation**: [https://docs.0g.ai/0g-da](https://docs.0g.ai/0g-da)
- **0G Compute Platform**: [https://docs.0g.ai/0g-compute](https://docs.0g.ai/0g-compute)

## Support

For support and questions:
- Open an issue on GitHub
- Join our community discussions
- Check the documentation for troubleshooting guides

---

Built with ❤️ for the decentralized future of social media.