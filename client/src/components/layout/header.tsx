import { useState } from "react";
import { Bell, Moon, Sun, Search, Wallet, Copy, ExternalLink } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
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
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Switch to 0G Chain if not already connected
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x40D9' }], // 16601 in hex
            });
          } catch (switchError: any) {
            // Chain not added to MetaMask, add it
            if (switchError.code === 4902) {
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
            }
          }

          // Send wallet connection to backend
          const response = await fetch('/api/web3/connect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: accounts[0],
              chainId: '16601',
              network: '0G-Galileo-Testnet'
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to register wallet connection');
          }

          return { success: true, account: accounts[0] };
        } catch (error: any) {
          throw new Error(error.message || 'Failed to connect wallet');
        }
      } else {
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
    <header className="sticky top-0 z-50 glassmorphism border-b border-og-slate-200 dark:border-og-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">0G</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">
              0G Social
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-og-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search posts, users, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-og-slate-100 dark:bg-og-slate-800 border border-og-slate-200 dark:border-og-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-og-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {/* MetaMask Wallet Connection */}
            {walletStatus?.connected && web3Status?.connected ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                    {formatAddress(walletStatus.address)}
                  </span>
                  <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-300 dark:border-green-700">
                    {web3Status.network}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-800"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => connectWallet.mutate()}
                disabled={connectWallet.isPending}
                className="flex items-center space-x-2 gradient-brand text-white hover:opacity-90 transition-opacity"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {connectWallet.isPending ? "Connecting..." : "Connect MetaMask"}
                </span>
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-og-slate-100 dark:hover:bg-og-slate-800 transition-colors"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative p-2 rounded-lg hover:bg-og-slate-100 dark:hover:bg-og-slate-800 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </Button>

            {/* Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 avatar-gradient-1 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
