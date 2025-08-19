import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ImageIcon, Database, Loader2, Wallet } from "lucide-react";

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

export function CreatePost() {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check wallet connection status
  const { data: walletStatus } = useQuery({
    queryKey: ["/api/web3/wallet"],
    queryFn: async () => {
      const response = await fetch("/api/web3/wallet");
      if (!response.ok && response.status !== 404) {
        throw new Error("Failed to fetch wallet status");
      }
      return response.json();
    },
    refetchInterval: 5000, // Check every 5 seconds
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      // Step 1: Request MetaMask signature
      if (!window.ethereum) {
        throw new Error("MetaMask not detected. Please install MetaMask to continue.");
      }

      try {
        // Connect to MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create message to sign
        const timestamp = Date.now();
        const message = `0G Social Post Signature\n\nContent: ${data.content}\nTimestamp: ${timestamp}\n\nBy signing this message, you authorize posting this content to the 0G Storage network.`;
        
        // Request signature from user
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const account = accounts[0];
        
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, account],
        });

        // Step 2: Send post with signature to backend
        return await apiRequest("POST", "/api/posts", {
          content: data.content,
          signature,
          message,
          timestamp,
          address: account
        });
      } catch (error: any) {
        if (error.code === 4001) {
          throw new Error("Signature cancelled by user");
        }
        throw error;
      }
    },
    onSuccess: (data: any) => {
      setContent("");
      // Invalidate all posts queries with broad matching to refresh the feed
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.includes('/api/posts');
        }
      });
      
      // Invalidate user profile to update post count in sidebar
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      
      // Force immediate refetch of the current feed and profile with a slight delay to ensure backend processing
      setTimeout(() => {
        queryClient.refetchQueries({
          predicate: (query) => {
            const key = query.queryKey[0];
            return typeof key === 'string' && (key === '/api/posts/feed' || key === '/api/users/me');
          }
        });
      }, 100);
      
      // Show success message with 0G Storage information
      if (data.storageStatus === "pending") {
        toast({
          title: "Post created successfully",
          description: "Your post is visible in your feed. 0G Storage upload will retry when the Galileo testnet is available. You may need tokens from https://faucet.0g.ai",
          variant: "default",
        });
      } else {
        toast({
          title: "Post created successfully", 
          description: data.storageHash 
            ? `Content stored on 0G Storage: ${data.storageHash.substring(0, 12)}...`
            : "Your post has been published to the decentralized network",
        });
      }
    },
    onError: (error: any) => {
      let errorMessage = "Failed to create post";
      
      if (error.code === "WALLET_NOT_CONNECTED") {
        errorMessage = "Please connect your wallet to create posts";
      } else if (error.message?.includes("MetaMask")) {
        errorMessage = error.message;
      } else if (error.message?.includes("Signature")) {
        errorMessage = error.message;
      } else if (error.code === 4001) {
        errorMessage = "Signature cancelled by user";
      } else if (error.message?.includes("Galileo")) {
        errorMessage = "0G Galileo testnet is temporarily unavailable. Your post will still be created.";
      } else {
        errorMessage = error.message || "Failed to create post";
      }
      
      toast({
        title: "Failed to create post",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createPostMutation.mutate({ content: content.trim() });
  };

  const isWalletConnected = walletStatus?.connected === true;
  const isDisabled = !content.trim() || createPostMutation.isPending || !isWalletConnected;
  const characterCount = content.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;

  // If wallet is not connected, show connect wallet prompt
  if (!isWalletConnected) {
    return (
      <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Connect Wallet to Post
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                You need to connect your wallet to create posts on 0G Social. All posts are stored on the decentralized 0G Storage network.
              </p>
              <Button 
                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => {
                  // Scroll to Web3 status section or trigger wallet connection
                  toast({
                    title: "Connect your wallet",
                    description: "Look for the Web3 connection section in the sidebar to connect your wallet.",
                  });
                }}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex space-x-4">
            <div className="w-10 h-10 avatar-gradient-1 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <Textarea
                placeholder="What's happening on 0G Chain?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] border-0 text-lg resize-none placeholder:text-og-slate-500 focus-visible:ring-0"
                disabled={createPostMutation.isPending}
              />
              
              {/* Character count and 0G Storage info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-og-slate-200 dark:border-og-slate-700">
                <div className="flex items-center space-x-2 text-xs text-og-slate-500">
                  <Database className="w-3 h-3" />
                  <span>Content will be stored on 0G Storage</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${
                    isOverLimit 
                      ? "text-red-500" 
                      : characterCount > maxCharacters * 0.9 
                        ? "text-yellow-500" 
                        : "text-og-slate-500"
                  }`}>
                    {characterCount}/{maxCharacters}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-og-primary hover:bg-og-primary/10"
                      disabled={createPostMutation.isPending}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={isDisabled || isOverLimit}
                      className="bg-og-primary hover:bg-og-primary/90 text-white font-semibold px-6"
                    >
                      {createPostMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sign & Store to 0G...
                        </>
                      ) : (
                        "Sign & Post"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}