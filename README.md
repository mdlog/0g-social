# DeSocialAI

A fully decentralized, on-chain social media platform built on 0G Chain infrastructure, where users truly own their data and AI feeds.

## Overview

DeSocialAI represents the future of social networking - a platform where users maintain complete control over their data, content, and algorithms. Built on the cutting-edge 0G blockchain infrastructure, it eliminates corporate algorithm control and delivers true decentralization.

### Key Features

- **True Data Ownership**: All content stored on 0G Storage with cryptographic verification
- **User-Controlled AI**: Personal AI algorithms running on 0G Compute
- **Transparent Operations**: All interactions recorded on 0G DA (Data Availability)
- **Blockchain Verification**: Complete transaction verification on 0G Chain
- **MetaMask Integration**: Secure wallet-based authentication
- **Real-time Updates**: Live blockchain and network activity tracking
- **Cyberpunk UI**: Modern, futuristic interface with sci-fi aesthetics

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
- **0G Chain** for transaction verification and smart contracts
- **0G Storage** for decentralized content storage
- **0G DA** for transparent data availability
- **0G Compute** for user-owned AI algorithm execution
- **MetaMask** for wallet connection and signature verification

### AI Features
- **OpenAI GPT-4o** integration for content recommendations
- **Trend analysis** and user insights
- **Personalized feed algorithms**
- **Graceful degradation** when AI services are unavailable

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- MetaMask browser extension
- 0G Chain testnet access

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
   ZG_PRIVATE_KEY=your_0g_private_key
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
   Navigate to `http://localhost:5173` and connect your MetaMask wallet

## Usage

### Connecting Your Wallet

1. Click "Connect Wallet" on the landing page
2. Approve the MetaMask connection request
3. Sign the verification message to authenticate
4. You'll be redirected to your personalized feed

### Creating Posts

1. Use the post composer in the main feed
2. Add your content (text, images, or files)
3. Sign the transaction with MetaMask
4. Your post will be stored on 0G Storage and verified on-chain

### Blockchain Verification

All posts include:
- **Storage Hash**: Cryptographic proof of content on 0G Storage
- **Transaction Hash**: On-chain verification record
- **Block Height**: Blockchain confirmation details
- **Verification Status**: Real-time validation indicators

### File Uploads

The platform supports secure file uploads through:
- **Object Storage Integration**: Files stored on 0G infrastructure
- **ACL Policies**: Granular access control for user content
- **Presigned URLs**: Secure, direct-to-storage uploads

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

The application uses a carefully designed schema:

- **Users**: Wallet-based user profiles with avatar support
- **Posts**: Content with blockchain verification hashes
- **Follows**: Social graph relationships
- **Likes**: User engagement tracking
- **Comments**: Threaded discussions (planned)

### API Endpoints

#### Authentication
- `GET /api/users/me` - Get current user profile
- `POST /api/web3/connect` - Connect MetaMask wallet
- `POST /api/web3/verify` - Verify wallet signature

#### Content
- `GET /api/posts/feed` - Get personalized post feed
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/users/:id/follow` - Follow/unfollow user

#### Blockchain
- `GET /api/web3/status` - Get blockchain connection status
- `GET /api/zg/storage/stats` - Get storage network statistics
- `GET /api/zg/da/stats` - Get data availability statistics
- `GET /api/zg/compute/stats` - Get compute network statistics

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

## Contributing

We welcome contributions to 0G Social! Please follow these guidelines:

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
- **0G Chain** - Layer 1 blockchain for verification
- **0G Storage** - Decentralized storage network
- **0G DA** - Data availability layer
- **0G Compute** - Decentralized computing platform
- **MetaMask** - Wallet connection and signing

### AI & Analytics
- **OpenAI GPT-4o** - Advanced language model integration
- **Custom Analytics** - Real-time network statistics
- **Trend Analysis** - AI-powered content insights

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