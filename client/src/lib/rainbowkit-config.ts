import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'viem';

// Definisi 0G Chain Newton Testnet
export const zgChainNewtonTestnet: Chain = {
  id: 16600,
  name: '0G Newton Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'A0GI Token',
    symbol: 'A0GI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-newton.0g.ai',
    },
  },
  testnet: true,
};

// Konfigurasi RainbowKit dengan 0G Chain
export const wagmiConfig = getDefaultConfig({
  appName: 'DeSocialAI',
  projectId: 'desocialai-zg-chain', // ID project untuk WalletConnect
  chains: [zgChainNewtonTestnet], // Hanya gunakan 0G Chain Newton testnet
  ssr: false, // Disable server-side rendering untuk Vite
});