# DeSocialAI - Arsitektur Aplikasi Lengkap

## 📋 Ringkasan Proyek

**DeSocialAI** adalah platform media sosial terdesentralisasi yang dibangun di atas infrastruktur 0G Chain (Galileo Testnet). Platform ini memberikan kontrol penuh kepada user atas data mereka dengan menggunakan teknologi blockchain untuk penyimpanan, komputasi AI, dan ketersediaan data.

## 🏗️ Arsitektur Sistem

### **Frontend Architecture**
```
client/
├── src/
│   ├── components/           # Komponen UI React
│   │   ├── auth/            # Komponen autentikasi wallet
│   │   ├── layout/          # Layout utama (Header, Sidebar, Footer)
│   │   ├── posts/           # Komponen posting & feed
│   │   ├── ui/              # shadcn/ui components
│   │   └── web3/            # Komponen blockchain interaction
│   ├── hooks/               # React custom hooks
│   │   ├── use-auth.ts      # Hook autentikasi
│   │   ├── use-websocket.ts # Real-time WebSocket connection
│   │   └── use-toast.ts     # Notifikasi toast
│   ├── lib/                 # Utilitas dan konfigurasi
│   │   ├── queryClient.ts   # TanStack Query setup
│   │   └── utils.ts         # Helper functions
│   ├── pages/               # Halaman aplikasi
│   │   ├── home.tsx         # Feed utama
│   │   ├── profile.tsx      # Halaman profil user
│   │   └── settings.tsx     # Pengaturan user
│   └── App.tsx              # Root component dengan routing
```

**Teknologi Frontend:**
- **React 18**: Framework utama
- **TypeScript**: Type safety
- **Vite**: Build tool & development server
- **Tailwind CSS**: Styling framework
- **shadcn/ui**: Component library berbasis Radix UI
- **TanStack Query**: Server state management
- **Wouter**: Client-side routing
- **RainbowKit**: Wallet connection interface

### **Backend Architecture**
```
server/
├── services/               # Layer service business logic
│   ├── zg-storage.ts      # 0G Storage integration
│   ├── zg-da.ts           # 0G Data Availability service
│   └── zg-compute.ts      # 0G Compute service
├── proto/                 # gRPC Protocol definitions
│   ├── da.proto           # Data Availability protocol
│   └── compute.proto      # Compute service protocol
├── types/                 # TypeScript type definitions
├── db.ts                  # Database connection & setup
├── storage.ts             # Data access layer (DAL)
├── routes.ts              # API endpoints
├── index.ts               # Server entry point
└── vite.ts                # Vite integration
```

**Teknologi Backend:**
- **Express.js**: Web framework
- **TypeScript (ES Modules)**: Type-safe backend
- **PostgreSQL**: Database utama
- **Drizzle ORM**: Type-safe database toolkit
- **WebSocket**: Real-time communication
- **gRPC**: Komunikasi dengan 0G services

### **Database Schema**
```
shared/schema.ts
├── Users Table
│   ├── id: string (UUID)
│   ├── username: string
│   ├── displayName: string
│   ├── walletAddress: string (unique)
│   ├── avatar: string (nullable)
│   ├── bio: string (nullable)
│   ├── followersCount: number
│   ├── followingCount: number
│   └── createdAt: timestamp
│
├── Posts Table
│   ├── id: string (UUID)
│   ├── authorId: string (FK to Users)
│   ├── content: string
│   ├── mediaUrl: string (nullable)
│   ├── zkStorageHash: string (nullable)
│   ├── zkDAHash: string (nullable)
│   ├── likesCount: number
│   ├── commentsCount: number
│   ├── repostsCount: number
│   └── createdAt: timestamp
│
├── Comments Table
│   ├── id: string (UUID)
│   ├── postId: string (FK to Posts)
│   ├── authorId: string (FK to Users)
│   ├── content: string
│   ├── likesCount: number
│   └── createdAt: timestamp
│
├── Likes Table
│   ├── id: string (UUID)
│   ├── userId: string (FK to Users)
│   ├── postId: string (FK to Posts)
│   └── createdAt: timestamp
│
├── Follows Table
│   ├── id: string (UUID)
│   ├── followerId: string (FK to Users)
│   ├── followingId: string (FK to Users)
│   └── createdAt: timestamp
│
└── Reposts Table
    ├── id: string (UUID)
    ├── userId: string (FK to Users)
    ├── postId: string (FK to Posts)
    └── createdAt: timestamp
```

## 👤 Sistem Profil User - Penjelasan Detail

### **User Profile Structure**

#### **1. Basic Information**
```typescript
interface User {
  id: string;                    // UUID unik user
  username: string;              // Username unik (@username)
  displayName: string;           // Nama tampilan user
  walletAddress: string;         // Alamat wallet 0G Chain (unik)
  avatar: string | null;         // URL avatar (opsional)
  bio: string | null;            // Bio deskripsi user (opsional)
  followersCount: number;        // Jumlah pengikut
  followingCount: number;        // Jumlah yang diikuti
  createdAt: Date;               // Tanggal registrasi
}
```

#### **2. Profile Management Features**

**a. Wallet-Based Authentication**
- User login menggunakan **RainbowKit** dengan wallet 0G Chain
- Alamat wallet berfungsi sebagai identitas unik
- Tidak ada password tradisional - hanya signature wallet

**b. Profile Creation & Updates**
```typescript
// Saat pertama kali connect wallet
const createUserProfile = async (walletAddress: string) => {
  return {
    username: `user_${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    displayName: `0G User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
    walletAddress: walletAddress,
    avatar: null,
    bio: null
  };
};
```

**c. Profile Customization**
- **Avatar Upload**: Mendukung upload gambar profil
- **Display Name**: User bisa mengubah nama tampilan
- **Bio**: Deskripsi singkat tentang user
- **Username**: Sistem auto-generate, bisa diubah (unik)

#### **3. Profile Statistics**

**Real-time Metrics:**
```typescript
interface ProfileStats {
  postsCount: number;        // Total posts user
  followersCount: number;    // Jumlah followers
  followingCount: number;    // Jumlah following
  likesReceived: number;     // Total likes yang diterima
  commentsReceived: number;  // Total comments yang diterima
}
```

**Activity Tracking:**
- Post creation timestamps
- Interaction history (likes, comments, reposts)
- Following/follower relationships
- Account creation date

#### **4. Profile Pages & Navigation**

**Profile Page Layout:**
```tsx
<ProfilePage>
  <ProfileHeader>
    <Avatar />
    <UserInfo>
      <DisplayName />
      <Username />
      <WalletAddress />
    </UserInfo>
    <FollowButton />
  </ProfileHeader>
  
  <ProfileStats>
    <PostsCount />
    <FollowersCount />
    <FollowingCount />
  </ProfileStats>
  
  <ProfileTabs>
    <PostsTab />      // User's posts
    <RepliesTab />    // User's comments
    <MediaTab />      // Posts with media
    <LikesTab />      // Liked posts
  </ProfileTabs>
</ProfilePage>
```

#### **5. Social Features**

**Following System:**
```typescript
// Follow user
POST /api/users/:userId/follow
{
  followerId: currentUser.id,
  followingId: targetUser.id
}

// Unfollow user
DELETE /api/users/:userId/follow

// Get followers list
GET /api/users/:userId/followers

// Get following list
GET /api/users/:userId/following
```

**Profile Interactions:**
- View public posts
- Follow/unfollow functionality
- Direct mentions (@username)
- Profile sharing capabilities

#### **6. Privacy & Security**

**Wallet Integration:**
- Profile terhubung langsung dengan wallet 0G Chain
- Setiap interaksi memerlukan wallet signature
- Transaction history tersimpan on-chain

**Data Ownership:**
- User memiliki kontrol penuh atas data profil
- Data tersimpan terdesentralisasi di 0G network
- Bisa export/import data profil

## 🌐 Integrasi 0G Chain Infrastructure

### **1. 0G Storage Integration**
```typescript
// Upload avatar ke 0G Storage
const uploadAvatar = async (file: File) => {
  const storageHash = await zgStorage.upload(file);
  await updateUserProfile({ avatar: storageHash });
  return storageHash;
};
```

### **2. 0G Data Availability**
```typescript
// Semua interaksi profile disimpan di DA layer
const recordProfileUpdate = async (userId: string, changes: any) => {
  await zgDA.submitBlob({
    type: 'profile_update',
    userId: userId,
    changes: changes,
    timestamp: new Date().toISOString()
  });
};
```

### **3. 0G Compute (AI Features)**
```typescript
// AI-powered profile recommendations
const getProfileRecommendations = async (userId: string) => {
  return await zgCompute.executeJob({
    algorithm: 'profile_similarity',
    input: { userId },
    computeType: 'recommendation'
  });
};
```

## 🔄 Real-Time Features

### **WebSocket Integration**
```typescript
// Real-time profile updates
websocket.on('profile_updated', (data) => {
  queryClient.invalidateQueries(['users', data.userId]);
  updateProfileCache(data);
});

// Real-time follower notifications
websocket.on('new_follower', (data) => {
  showNotification(`${data.follower.displayName} started following you!`);
  updateFollowersCount(data.userId);
});
```

## 🎨 UI/UX Design

### **Theme System**
- **Dark Mode**: Default theme untuk pengalaman premium
- **Cyberpunk Aesthetic**: Sesuai dengan brand blockchain/crypto
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant

### **Component Hierarchy**
```
App
├── Layout
│   ├── Header (Wallet connection, Navigation)
│   ├── Sidebar (Trending, AI Insights, User suggestions)
│   └── Footer (Platform info)
├── Pages
│   ├── Home (Feed utama)
│   ├── Profile (User profiles)
│   ├── Settings (User preferences)
│   └── Explore (Discover content)
└── Modals
    ├── CreatePost
    ├── EditProfile
    └── WalletConnect
```

## 🔧 Development Workflow

### **Local Development**
1. `npm install` - Install dependencies
2. `npm run dev` - Start development server
3. `npm run db:push` - Push database schema changes
4. WebSocket server otomatis berjalan di port yang sama

### **Environment Variables**
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
COMBINED_SERVER_CHAIN_RPC=https://0g-galileo-testnet.drpc.org/
COMBINED_SERVER_PRIVATE_KEY=...
ENTRANCE_CONTRACT_ADDR=0x857C0A28A8634614BB2C96039Cf4a20AFF709Aa9
GRPC_SERVER_PORT=51001
```

### **Deployment**
- Platform: Replit Deployments
- Auto-scaling: Ya
- SSL: Automatic dengan domain .replit.app
- Monitoring: Real-time logs dan metrics

## 📊 Performance Optimizations

### **Frontend**
- **Code Splitting**: Lazy loading untuk pages
- **Query Caching**: TanStack Query dengan smart invalidation
- **Image Optimization**: WebP format dengan lazy loading
- **Bundle Optimization**: Tree shaking dan minification

### **Backend**
- **Database Indexing**: Optimized queries dengan proper indexes
- **Connection Pooling**: PostgreSQL connection pooling
- **Caching**: Redis-like caching untuk frequent queries
- **Rate Limiting**: API protection

### **Real-time**
- **WebSocket Optimization**: Connection pooling dan heartbeat
- **Selective Updates**: Hanya update data yang berubah
- **Batch Processing**: Group multiple updates

## 🔐 Security Features

### **Authentication**
- Wallet-based login (no passwords)
- Message signing untuk verifikasi
- Session management dengan secure cookies

### **Data Protection**
- Input sanitization dan validation
- SQL injection prevention
- XSS protection
- CORS configuration

### **Blockchain Security**
- Transaction verification on 0G Chain
- Smart contract interaction safety
- Private key encryption

## 🚀 Future Enhancements

### **Upcoming Features**
1. **NFT Profile Pictures**: Menggunakan NFT sebagai avatar
2. **Reputation System**: User credibility scoring
3. **Advanced AI Feeds**: Personalized content algorithms
4. **Governance Tokens**: DSAI token untuk voting
5. **Cross-chain Support**: Multi-blockchain integration
6. **Mobile Apps**: React Native iOS/Android
7. **Advanced Analytics**: Detailed user insights
8. **Content Monetization**: Creator economy features

### **Performance Roadmap**
- Database sharding untuk scalability
- CDN integration untuk media files
- Advanced caching strategies
- Microservices architecture migration

---

*Dokumentasi ini akan terus diupdate seiring perkembangan aplikasi DeSocialAI.*