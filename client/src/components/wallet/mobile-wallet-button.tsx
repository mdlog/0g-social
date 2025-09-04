import { useState } from "react";
import { Wallet, ChevronDown, ExternalLink, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isMobileBrowser, connectWalletMobile, isMetaMaskMobile, isInAppBrowser } from "@/utils/mobile-wallet";

interface WalletStatus {
  connected: boolean;
  infrastructureConnected: boolean;
  network: string;
  chainId: string;
  blockHeight: number;
  gasPrice: string;
  walletAddress?: string;
  balance?: string;
}

export function MobileWalletButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: walletStatus } = useQuery<WalletStatus>({
    queryKey: ["/api/web3/status"],
    refetchInterval: 5000,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      setIsConnecting(true);
      
      try {
        // Check if we're on mobile
        if (isMobileBrowser()) {
          console.log("[Mobile Wallet] Detected mobile browser");
          
          // Check if we're in an in-app browser
          if (isInAppBrowser()) {
            throw new Error("Please open this page in your main browser or MetaMask app to connect your wallet.");
          }
          
          // Try to connect using mobile-specific method
          const result = await connectWalletMobile();
          console.log("[Mobile Wallet] Connection result:", result);
          
          // Send connection data to backend
          const response = await fetch("/api/web3/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              address: result.address,
              chainId: result.chainId,
              isMobile: true
            }),
          });
          
          if (!response.ok) {
            throw new Error("Failed to register wallet connection");
          }
          
          return result;
        } else {
          // Desktop fallback - try to use window.ethereum
          if (typeof window !== 'undefined' && (window as any).ethereum) {
            const ethereum = (window as any).ethereum;
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            
            if (!accounts || accounts.length === 0) {
              throw new Error('No accounts found');
            }
            
            // Send connection data to backend
            const response = await fetch("/api/web3/connect", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                address: accounts[0],
                chainId: chainId,
                isMobile: false
              }),
            });
            
            if (!response.ok) {
              throw new Error("Failed to register wallet connection");
            }
            
            return { address: accounts[0], chainId, connected: true };
          } else {
            throw new Error("No wallet found. Please install MetaMask or use a Web3 browser.");
          }
        }
      } finally {
        setIsConnecting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/web3/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Wallet Connected",
        description: isMobileBrowser() 
          ? "Your mobile wallet has been connected successfully!" 
          : "Your wallet has been connected successfully!",
      });
    },
    onError: (error: any) => {
      console.error("[Mobile Wallet] Connection error:", error);
      
      let errorMessage = error.message || "Failed to connect wallet";
      
      if (isMobileBrowser()) {
        if (errorMessage.includes("MetaMask mobile app required")) {
          errorMessage = "MetaMask Required:\n• Install MetaMask mobile app\n• Open this site in MetaMask browser\n• Or try another Web3 wallet";
        } else if (errorMessage.includes("in-app browser")) {
          errorMessage = "Please open this page in your main browser or MetaMask app to connect your wallet.";
        } else if (errorMessage.includes("User rejected")) {
          errorMessage = "Connection cancelled by user";
        } else {
          errorMessage = "Mobile wallet connection failed. Please try:\n• MetaMask mobile app\n• WalletConnect\n• Other Web3 browsers";
        }
      } else {
        if (errorMessage.includes("MetaMask not found")) {
          errorMessage = "Please install MetaMask browser extension or use a Web3-enabled browser.";
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/web3/disconnect", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to disconnect wallet");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/web3/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const isConnected = walletStatus?.connected;
  const address = walletStatus?.walletAddress;
  const balance = walletStatus?.balance;

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 max-w-[140px] sm:max-w-none"
          >
            <Wallet className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <span className="sm:hidden">
              {address.slice(0, 4)}...
            </span>
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4" />
              <span className="font-medium">Wallet Connected</span>
              {isMobileBrowser() && (
                <Smartphone className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Address: {address.slice(0, 10)}...{address.slice(-6)}</div>
              {balance && <div>Balance: {balance}</div>}
              <div>Network: {walletStatus.network}</div>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDisconnect}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      disabled={isConnecting || connectMutation.isPending}
      size="sm"
      className="flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      <span className="hidden sm:inline">
        {isConnecting || connectMutation.isPending ? "Connecting..." : "Connect Wallet"}
      </span>
      <span className="sm:hidden">
        {isConnecting || connectMutation.isPending ? "..." : "Connect"}
      </span>
      {isMobileBrowser() && (
        <Smartphone className="w-3 h-3 opacity-60" />
      )}
    </Button>
  );
}