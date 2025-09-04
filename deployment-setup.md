# Production Deployment Configuration for DeSocialAI

## Required Environment Variables for Production

Untuk mengatasi masalah koneksi ke `127.0.0.1:5678` di production, pastikan environment variables berikut ter-set:

### 0G Storage Configuration
```bash
# 0G Storage Network Endpoints
ZGS_NODE_URL=http://38.96.255.34:5678
ZG_STORAGE_URL=http://38.96.255.34:5678
ZGS_RPC_URL=http://38.96.255.34:5678

# 0G Chain Configuration
ZG_RPC_URL=https://evmrpc-testnet.0g.ai
ZG_INDEXER_RPC=http://38.96.255.34:6789/

# Essential Keys (must be set)
ZG_PRIVATE_KEY=your_private_key_here

# Object Storage (if used)
SIDECAR_ENDPOINT=http://38.96.255.34:1106
PUBLIC_OBJECT_SEARCH_PATHS=/public
PRIVATE_OBJECT_DIR=/.private

# Environment
NODE_ENV=production
```

### Setting Environment Variables in Replit Deployment

1. **Via Replit Secrets**: Add these variables to your Replit Secrets
2. **Via Environment Tab**: Use the Environment Variables section in your Repl
3. **Via Code**: The app will automatically use the correct endpoints for production

### Verification

After deployment, check logs for:
- `[0G Storage] Environment: production`
- `[0G Storage] Using storage endpoint: http://38.96.255.34:5678`
- No `ECONNREFUSED 127.0.0.1:5678` errors

### Common Issues

1. **Missing ZG_PRIVATE_KEY**: App will fail to initialize 0G Storage
2. **Incorrect endpoints**: Will cause connection failures
3. **Mixed development/production configs**: Can cause localhost connection attempts

### Deploy Command

```bash
# Make sure all environment variables are set before deployment
npm run build && npm start
```

The application now automatically detects production environment and uses the correct endpoints.