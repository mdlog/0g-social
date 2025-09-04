# DeSocialAI

A revolutionary decentralized social AI platform powered by 0G Chain infrastructure, featuring advanced AI agents, blockchain verification, and comprehensive analytics - where users truly own their data, AI, and social experiences.

## Overview

DeSocialAI represents the next generation of social networking with cutting-edge AI technology - a platform where users maintain complete control over their data, content, algorithms, and AI assistants. Built on the advanced 0G blockchain infrastructure, it eliminates corporate algorithm control and delivers true decentralization with sophisticated AI capabilities and elegant design.

## 🚀 Advanced Technology Features

### **🤖 AI Personal Assistant System**
- **Multi-Agent Architecture**: 5 specialized AI agent types
  - Content Assistant: Creates engaging posts and content
  - Engagement Manager: Manages interactions and responses  
  - Trend Analyzer: Identifies and analyzes trending topics
  - Network Growth: Expands connections strategically
  - Content Scheduler: Optimizes posting times for maximum reach
- **0G Compute Integration**: Pure authentic AI processing on decentralized network
- **Performance Tracking**: Real-time metrics and success analytics
- **Autonomous Operation**: AI agents work independently to grow your presence

### **📊 Advanced Analytics Dashboard**
- **Deep User Analytics**: Comprehensive engagement, content, and network analysis
- **AI-Powered Trend Detection**: Real-time platform trend identification
- **Viral Content Predictor**: AI scoring system for content viral potential
- **Behavioral Pattern Analysis**: User posting and consumption insights
- **Smart Recommendations**: Personalized growth strategies powered by AI
- **Network Quality Scoring**: Advanced metrics for connection quality

### **🔐 Blockchain Verification System**
- **Content Authenticity**: Cryptographic proof of original content
- **Identity Verification**: Wallet signature-based user verification
- **Reputation System**: Blockchain-backed user credibility scoring
- **Immutable Records**: All verifications stored on 0G Data Availability
- **Proof Generation**: QR codes and verification URLs for authenticity
- **Smart Contract Integration**: Automated verification via 0G Chain

### **Core Platform Features**
- **True Data Ownership**: All content stored on 0G Storage with cryptographic verification
- **User-Controlled AI**: Personal AI algorithms running on 0G Compute
- **Transparent Operations**: All interactions recorded on 0G DA (Data Availability)
- **Blockchain Verification**: Complete transaction verification on 0G Chain
- **RainbowKit Integration**: Modern wallet connection with multi-wallet support
- **Real-time Updates**: Live blockchain and network activity with WebSocket connections
- **Elegant Design**: Modern minimalist interface with refined typography and glass effects
- **Media Upload System**: Secure file uploads with object storage integration
- **Real-time Communication**: Live comment system with WebSocket broadcasting

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

### Advanced AI & Machine Learning
- **0G Compute Network**: Decentralized AI processing without fallbacks
- **OpenAI GPT-5** integration for advanced content recommendations
- **Multi-Agent System**: Specialized AI agents for different social media tasks
- **Advanced Analytics Engine**: Real-time trend analysis and viral predictions
- **Content Intelligence**: Automated categorization and recommendation systems
- **Behavioral Analysis**: Deep user pattern recognition and insights
- **Blockchain Integration**: AI-powered verification and authenticity scoring

## 🛠️ Technical Implementation

### **Advanced API Endpoints**

#### AI Agent Management
- `POST /api/ai/agents` - Create specialized AI agents
- `GET /api/ai/agents` - List user's AI agents
- `POST /api/ai/agents/:agentId/generate` - Generate content via AI agent

#### Advanced Analytics
- `GET /api/analytics/user?range=30d` - Comprehensive user analytics
- `GET /api/analytics/trends` - Platform-wide trend analysis
- `POST /api/analytics/predict-viral` - AI-powered viral content prediction

#### Blockchain Verification
- `POST /api/verify/content` - Verify content authenticity on blockchain
- `GET /api/verify/reputation/:userId` - Get user reputation score
- `POST /api/verify/identity` - Verify user identity with wallet signature

### **Advanced UI Components**

#### AI Assistant Panel (`client/src/components/ai-assistant-panel.tsx`)
- Multi-tab interface for agent management
- Real-time agent performance tracking
- Content generation with AI agents
- Agent creation wizard with configuration options

#### Analytics Dashboard (`client/src/components/analytics-dashboard.tsx`)
- Comprehensive metrics visualization
- Trend analysis with confidence scoring
- Viral content predictor interface
- Network growth analytics

### **Service Architecture**

#### AI Agent Service (`server/services/ai-agent-service.ts`)
- Multi-agent system with 5 specialized types
- 0G Compute Network integration for authentic AI processing
- Performance tracking and optimization
- Autonomous operation capabilities

#### Advanced Analytics Service (`server/services/advanced-analytics.ts`)
- Deep user behavior analysis
- AI-powered trend detection
- Viral content prediction algorithms
- Personalized recommendation engine

#### Blockchain Verification Service (`server/services/blockchain-verification.ts`)
- Content authenticity verification
- Identity verification with cryptographic signatures
- Reputation system with blockchain backing
- Immutable proof generation

## Getting Started

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- Modern browser with Web3 wallet support (MetaMask, WalletConnect, etc.)
- 0G Chain Galileo Testnet access
- OpenAI API key for AI features
- Sufficient 0G tokens for Compute Network operations

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
│   │   ├── components/
│   │   │   ├── ai-assistant-panel.tsx      # AI Agent management interface
│   │   │   ├── analytics-dashboard.tsx     # Advanced analytics and insights
│   │   │   └── ...                        # Other UI components
│   │   ├── pages/             # Application pages and routing
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/              # Utilities and configurations
├── server/                # Express.js backend application
│   ├── services/
│   │   ├── ai-agent-service.ts            # Multi-agent AI system
│   │   ├── advanced-analytics.ts          # Analytics and insights engine
│   │   ├── blockchain-verification.ts     # Content authenticity verification
│   │   ├── zg-compute-real.ts            # 0G Compute Network integration
│   │   ├── zg-da-client.ts               # 0G Data Availability client
│   │   └── ...                           # Other service implementations
│   ├── routes.ts          # API endpoint definitions
│   └── storage.ts         # Database abstraction layer
├── shared/                # Shared TypeScript definitions
│   └── schema.ts          # Database schema and type definitions
└── README.md             # This comprehensive documentation

## 🌟 Latest Technology Updates (September 2025)

### **Revolutionary AI Agent System**
- **5 Specialized Agent Types**: Each with unique capabilities and performance metrics
- **Autonomous Content Creation**: AI agents that work independently to grow your social presence
- **0G Compute Integration**: Pure decentralized AI without any fallback systems
- **Real-time Performance Tracking**: Monitor agent effectiveness and success rates

### **Advanced Analytics & Intelligence**
- **Deep User Insights**: Comprehensive analysis of engagement patterns and content performance
- **AI-Powered Trend Detection**: Real-time identification of emerging topics and opportunities
- **Viral Content Prediction**: Machine learning algorithms that score content viral potential
- **Network Quality Analysis**: Advanced metrics for connection value and community engagement

### **Blockchain Verification & Authenticity**
- **Content Authenticity Proofs**: Cryptographic verification of original content creation
- **Identity Verification System**: Wallet signature-based user authentication
- **Reputation Scoring**: Blockchain-backed credibility system with transparent metrics
- **Immutable Record Storage**: All verifications permanently stored on 0G Data Availability

### **Enhanced User Experience**
- **Intelligent UI Components**: Advanced interfaces for AI agent management and analytics
- **Real-time Insights**: Live updating dashboards with actionable recommendations
- **Seamless Integration**: All advanced features integrated into existing platform
- **Performance Optimized**: Efficient API endpoints with comprehensive error handling

## 🎯 Technology Differentiators

### **Why DeSocialAI Leads the Market**

1. **Pure 0G Chain Integration** - No fallback systems, authentic blockchain implementation
2. **Multi-Agent AI System** - First social platform with specialized AI agents for different tasks
3. **Advanced Analytics Engine** - AI-powered insights beyond basic metrics
4. **Blockchain Verification** - Every interaction cryptographically verified
5. **True Data Ownership** - Users control their data, algorithms, and AI assistants

### **Competitive Advantages**
- **Zero Corporate Algorithm Control** - Users set their own content discovery parameters
- **AI Agent Workforce** - Personal AI assistants handle routine social media tasks
- **Decentralized Intelligence** - AI processing on 0G Compute Network
- **Immutable Authenticity** - All content and interactions blockchain verified
- **Revenue Sharing** - Platform fees absorbed, users benefit from network effects

## 🏆 Technical Achievements

### **September 2025 Milestone Features**
✅ Complete 0G Chain Infrastructure Integration  
✅ Multi-Agent AI Assistant System  
✅ Advanced Analytics & Viral Prediction Engine  
✅ Blockchain Verification & Authenticity System  
✅ Real-time WebSocket Communication  
✅ Comprehensive API Architecture  
✅ Advanced UI Components & Dashboards  
✅ Performance Optimization & Error Handling

## 📋 Project Status

### **Current Capabilities**
- **Full 0G Chain Integration**: Storage, DA, Compute, and Chain networks
- **AI Agent System**: 5 specialized agents with autonomous operation
- **Advanced Analytics**: User insights, trend analysis, viral prediction
- **Blockchain Verification**: Content authenticity and identity verification
- **Real-time Updates**: WebSocket-based live communication
- **Modern UI/UX**: Responsive design with dark mode support

### **Technology Metrics**
- **API Endpoints**: 25+ comprehensive endpoints
- **Service Architecture**: 3 major service layers (AI, Analytics, Verification)
- **Database Schema**: 5+ optimized tables with relationship modeling
- **Real-time Features**: WebSocket integration across all components
- **Type Safety**: 100% TypeScript coverage across frontend and backend

### Project Structure

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

#### Advanced AI & Analytics (NEW)
- `POST /api/ai/agents` - Create specialized AI agents
- `GET /api/ai/agents` - List user's AI agents with performance metrics
- `POST /api/ai/agents/:agentId/generate` - Generate content using AI agent
- `GET /api/analytics/user?range=30d` - Comprehensive user analytics
- `GET /api/analytics/trends` - AI-powered trend analysis
- `POST /api/analytics/predict-viral` - Viral content prediction scoring
- `GET /api/ai/insights` - Get personalized AI insights
- `GET /api/ai/trending` - Get trending topics analysis
- `GET /api/stats` - Get platform statistics

#### Blockchain Verification (NEW)
- `POST /api/verify/content` - Verify content authenticity on blockchain
- `GET /api/verify/reputation/:userId` - Get blockchain-backed user reputation
- `POST /api/verify/identity` - Verify user identity with wallet signature

## Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   # Required environment variables for production
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   COMBINED_SERVER_PRIVATE_KEY=0x...
   COMBINED_SERVER_CHAIN_RPC=https://evmrpc-testnet.0g.ai
   ENTRANCE_CONTRACT_ADDR=0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9
   SESSION_SECRET=your-secure-session-secret
   ```

3. **Deploy to production**
   The application is optimized for Replit deployment with automatic scaling

## 🤝 Contributing

We welcome contributions to DeSocialAI! Please check out our contributing guidelines and feel free to submit issues and enhancement requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌐 Links

- **Live Demo**: [DeSocialAI Platform](https://desocialai.xyz/)
- **0G Chain Documentation**: [docs.0g.ai](https://docs.0g.ai)
- **0G Compute Network**: [Decentralized AI Processing](https://docs.0g.ai/0g-compute)

---

**Built with ❤️ using 0G Chain infrastructure - The future of decentralized social networking with AI**

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