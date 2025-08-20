import { useState } from "react";
import { Bell, Moon, Sun, Search, Wallet, Copy, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useWebSocket } from "@/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { connected: wsConnected } = useWebSocket();

  const { data: walletStatus } = useQuery<{connected: boolean; address: string; balance: string}>({
    queryKey: ["/api/web3/wallet"],
    refetchInterval: 30000,
  });

  const { data: web3Status } = useQuery<{connected: boolean; network: string; chainId: number}>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 5000,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const connectWallet = useMutation({
    mutationFn: async () => {
      console.log('🔗 Starting wallet connection process...');
      
      if (typeof window.ethereum !== 'undefined') {
        try {
          console.log('✅ MetaMask detected');
          
          // Request account access
          console.log('📝 Requesting account access...');
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          console.log('✅ Accounts received:', accounts);
          
          // Switch to 0G Chain if not already connected
          console.log('🔄 Switching to 0G Chain...');
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x40D9' }], // 16601 in hex
            });
            console.log('✅ Successfully switched to 0G Chain');
          } catch (switchError: any) {
            console.log('⚠️ Chain switch failed:', switchError);
            // Chain not added to MetaMask, add it
            if (switchError.code === 4902) {
              console.log('➕ Adding 0G Chain to MetaMask...');
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x40D9',
                  chainName: '0G-Galileo-Testnet',
                  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
                  nativeCurrency: {
                    name: '0G',
                    symbol: '0G',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://chainscan-newton.0g.ai'],
                }],
              });
              console.log('✅ 0G Chain added successfully');
            }
          }

          // Send wallet connection to backend
          console.log('📤 Sending wallet data to backend...');
          const response = await fetch('/api/web3/connect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for session
            body: JSON.stringify({
              address: accounts[0],
              chainId: '16601',
              network: '0G-Galileo-Testnet'
            }),
          });

          console.log('📥 Backend response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Backend error:', errorText);
            throw new Error(`Failed to register wallet connection: ${errorText}`);
          }

          const result = await response.json();
          console.log('✅ Wallet connection successful:', result);
          
          return { success: true, account: accounts[0] };
        } catch (error: any) {
          console.error('❌ Wallet connection failed:', error);
          throw new Error(error.message || 'Failed to connect wallet');
        }
      } else {
        console.error('❌ MetaMask not detected');
        throw new Error('MetaMask is not installed');
      }
    },
    onSuccess: () => {
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to 0G Chain",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/web3/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/web3/status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectWallet = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/web3/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect wallet');
      }

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/web3/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/web3/status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearSession = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/web3/clear-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        throw new Error('Failed to clear session');
      }

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Session Cleared",
        description: "Session data cleared. Please reconnect your wallet.",
      });
      // Clear all cached data
      queryClient.clear();
      // Reload page to force fresh start
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Clear Session Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyAddress = () => {
    if (walletStatus?.address) {
      navigator.clipboard.writeText(walletStatus.address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 futuristic-card dark:futuristic-card-dark border-b border-transparent backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 slide-in-cyber">
            <div className="w-10 h-10 gradient-cyber-primary rounded-xl flex items-center justify-center pulse-glow">
              <span className="text-white font-bold text-sm neon-text">0G</span>
            </div>
            <h1 className="text-xl font-bold gradient-neon-text">
              DeSocialAI
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search the metaverse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 cyber-glass dark:cyber-glass-dark rounded-2xl border-0 focus:outline-none focus:neon-border-cyan placeholder-cyan-300/60 dark:placeholder-cyan-300/40 text-foreground"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {/* MetaMask Wallet Connection */}
            {walletStatus?.connected && web3Status?.connected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-4 py-2 cyber-glass dark:cyber-glass-dark rounded-2xl neon-border-cyan">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></div>
                  <span className="text-sm font-semibold text-cyan-100">
                    {formatAddress(walletStatus.address)}
                  </span>
                  <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-300 border-cyan-400/30 px-2 py-1">
                    {web3Status.network}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-7 w-7 p-0 hover:bg-cyan-500/20 transition-all duration-300"
                  >
                    <Copy className="h-3 w-3 text-cyan-300" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSession.mutate()}
                    disabled={clearSession.isPending}
                    className="px-3 py-2 cyber-glass dark:cyber-glass-dark text-yellow-300 hover:text-yellow-100 border-yellow-400/30 hover:border-yellow-400 transition-all duration-300"
                    title="Clear session if wallet data seems stuck"
                  >
                    {clearSession.isPending ? "Clearing..." : "Reset"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectWallet.mutate()}
                    disabled={disconnectWallet.isPending}
                    className="px-4 py-2 cyber-glass dark:cyber-glass-dark text-red-300 hover:text-red-100 border-red-400/30 hover:border-red-400 transition-all duration-300"
                  >
                    {disconnectWallet.isPending ? "Disconnecting..." : "Disconnect"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => connectWallet.mutate()}
                disabled={connectWallet.isPending}
                className="cyber-button flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {connectWallet.isPending ? "Connecting..." : "Connect Wallet"}
                </span>
              </Button>
            )}

            {/* Real-time Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 rounded-xl cyber-glass dark:cyber-glass-dark border border-cyan-400/20">
              {wsConnected ? (
                <Wifi className="h-4 w-4 text-cyan-400 pulse-glow" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
              <span className="text-xs font-medium text-cyan-200">
                {wsConnected ? "ONLINE" : "OFFLINE"}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-3 rounded-xl cyber-glass dark:cyber-glass-dark hover:neon-border-cyan transition-all duration-300"
            >
              {theme === "light" ? 
                <Moon className="h-4 w-4 text-cyan-300" /> : 
                <Sun className="h-4 w-4 text-yellow-300" />
              }
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative p-3 rounded-xl cyber-glass dark:cyber-glass-dark hover:neon-border-magenta transition-all duration-300"
            >
              <Bell className="h-4 w-4 text-magenta-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-magenta-400 rounded-full pulse-glow shadow-lg shadow-magenta-400/50"></div>
            </Button>

            {/* Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 avatar-gradient-1 rounded-full ring-2 ring-cyan-400/30 hover:ring-cyan-400/60 transition-all duration-300 float-animation"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
