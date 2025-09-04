import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ImageIcon, Database, Loader2, Wallet, X, Video } from "lucide-react";

// Helper function for formatting file sizes correctly
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function CreatePost() {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMediaURL, setUploadedMediaURL] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Handle file selection (only preview, don't upload yet)
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("[FRONTEND DEBUG] handleFileSelect called");
    const file = event.target.files?.[0];
    console.log("[FRONTEND DEBUG] Selected file:", file);
    if (!file) {
      console.log("[FRONTEND DEBUG] No file selected, returning");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Media files must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    // Store file and create preview (no upload yet)
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    toast({
      title: "File selected",
      description: "File will be uploaded when you post.",
    });
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadedMediaURL(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; file?: File }) => {
      // Step 1: Request MetaMask signature
      if (!window.ethereum) {
        throw new Error("MetaMask not detected. Please install MetaMask to continue.");
      }

      try {
        // Connect to MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create message to sign
        const timestamp = Date.now();
        const fileInfo = data.file ? `\nFile: ${data.file.name} (${data.file.size} bytes)` : '';
        const contentDisplay = data.content || '[Media post without text]';
        const message = `0G Social Post Signature\n\nContent: ${contentDisplay}${fileInfo}\nTimestamp: ${timestamp}\n\nBy signing this message, you authorize posting this content to the 0G Storage network.`;
        
        // Request signature from user
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const account = accounts[0];
        
        console.log('[FRONTEND DEBUG] Signing message with account:', account);
        console.log('[FRONTEND DEBUG] Message to sign:', message);
        
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, account],
        });
        
        console.log('[FRONTEND DEBUG] Signature received:', signature);

        // Step 2: Prepare form data for backend (includes file if present)
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('signature', signature);
        formData.append('message', message);
        formData.append('timestamp', timestamp.toString());
        formData.append('address', account);
        
        if (data.file) {
          formData.append('file', data.file);
        }

        // Step 3: Send post + file to backend
        console.log('[FRONTEND DEBUG] Sending FormData to backend...');
        console.log('[FRONTEND DEBUG] FormData keys:', Array.from(formData.keys()));
        
        // Debug the file specifically
        if (data.file) {
          console.log('[FRONTEND DEBUG] File details:');
          console.log('- Name:', data.file.name);
          console.log('- Size:', data.file.size, 'bytes');
          console.log('- Type:', data.file.type);
          console.log('- Last modified:', new Date(data.file.lastModified));
        }
        
        console.log('[FRONTEND DEBUG] About to call apiRequest with FormData...');
        
        let response: Response;
        try {
          response = await apiRequest('POST', '/api/posts', formData);
          
          console.log('[FRONTEND DEBUG] Response received successfully!');
          console.log('[FRONTEND DEBUG] Response status:', response.status);
          console.log('[FRONTEND DEBUG] Response ok:', response.ok);
        } catch (apiError: any) {
          console.error('[FRONTEND ERROR] apiRequest failed:', apiError);
          console.error('[FRONTEND ERROR] Error type:', typeof apiError);
          console.error('[FRONTEND ERROR] Error message:', apiError.message);
          console.error('[FRONTEND ERROR] Error stack:', apiError.stack);
          throw apiError; // Re-throw to be caught by outer catch
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.log('[FRONTEND DEBUG] Error response:', errorData);
          throw new Error(errorData.message || 'Failed to create post');
        }

        const result = await response.json();
        console.log('[FRONTEND DEBUG] Success response:', result);
        return result;
      } catch (error: any) {
        if (error.code === 4001) {
          throw new Error("Signature cancelled by user");
        }
        throw error;
      }
    },
    onSuccess: (data: any) => {
      setContent("");
      removeSelectedFile();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow post if there's content OR file (media)
    if (!content.trim() && !selectedFile) return;
    
    console.log("[FRONTEND] Starting post creation with MetaMask signature...");
    
    const postData = {
      content: content.trim() || '', // Allow empty content if there's a file
      file: selectedFile,
    };
    
    console.log("[FRONTEND] Post data prepared:", {
      content: postData.content,
      hasFile: !!postData.file,
      fileName: postData.file?.name
    });
    
    // Use mutation to handle post creation with proper error handling
    createPostMutation.mutate({ 
      content: postData.content, 
      file: postData.file || undefined 
    });
  };

  const isWalletConnected = walletStatus?.connected === true;
  // Button is enabled if there's content OR file, wallet connected, and not pending
  const hasContentOrFile = content.trim() || selectedFile;
  const isDisabled = !hasContentOrFile || createPostMutation.isPending || !isWalletConnected;
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
              
              {/* File preview */}
              {filePreview && (
                <div className="mt-3 relative">
                  <div className="relative inline-block rounded-lg overflow-hidden border border-og-slate-200 dark:border-og-slate-700">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img 
                        src={filePreview} 
                        alt="File preview" 
                        className="max-w-full max-h-48 object-cover"
                      />
                    ) : selectedFile?.type.startsWith('video/') ? (
                      <video 
                        src={filePreview} 
                        controls 
                        className="max-w-full max-h-48"
                      />
                    ) : null}
                    
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-og-slate-500 mt-1">
                    {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                  </p>
                </div>
              )}

              {/* Character count and 0G Storage info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-og-slate-200 dark:border-og-slate-700">
                <div className="flex items-center space-x-4">
                  {/* File upload button */}
                  <div className="flex items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading || createPostMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log("[FRONTEND DEBUG] Upload button clicked");
                        console.log("[FRONTEND DEBUG] File input ref:", fileInputRef.current);
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploading || createPostMutation.isPending}
                      className="text-og-primary hover:bg-og-primary/10"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : selectedFile?.type.startsWith('video/') ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-og-slate-500">
                    <Database className="w-3 h-3" />
                    <span>Content will be stored on 0G Storage</span>
                  </div>
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