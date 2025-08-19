import { Heart, MessageCircle, Share, Bookmark, Shield, Database, ExternalLink, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BlockchainVerification } from "@/components/blockchain-verification";
import type { PostWithAuthor } from "@shared/schema";

// Helper function for formatting file sizes correctly
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Manual retry mutation for 0G Storage uploads
  const retryStorageMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/retry-storage`);
    },
    onSuccess: () => {
      toast({
        title: "Upload retry initiated",
        description: "0G Storage upload retry has been queued. Check back in a few minutes.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Retry failed",
        description: error.message || "Could not initiate storage retry",
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (post.isLiked) {
        await apiRequest("DELETE", `/api/likes/${post.id}`);
      } else {
        await apiRequest("POST", "/api/likes", { postId: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      if (post.isReposted) {
        await apiRequest("DELETE", `/api/reposts/${post.id}`);
      } else {
        await apiRequest("POST", "/api/reposts", { postId: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: post.isReposted ? "Repost removed" : "Post reposted",
        description: post.isReposted ? "Your repost has been removed" : "Post has been shared to your followers",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Repost failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "now";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "now";
    if (hours < 24) return `${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const getAvatarClass = (userId: string) => {
    const classes = [
      "avatar-gradient-1",
      "avatar-gradient-2", 
      "avatar-gradient-3",
      "avatar-gradient-4"
    ];
    return classes[userId.charCodeAt(userId.length - 1) % classes.length];
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <article className="flex space-x-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage 
              src={post.author.avatar ? `${window.location.origin}${post.author.avatar}` : ""} 
              alt={post.author.displayName} 
              className="object-cover"
            />
            <AvatarFallback className={`${getAvatarClass(post.authorId)} text-white font-semibold text-sm`}>
              {post.author.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold">{post.author.displayName}</h4>
              <span className="text-og-slate-600 dark:text-og-slate-400">@{post.author.username}.0g</span>
              {post.author.isVerified && (
                <div className="flex items-center space-x-1">
                  <Shield className="text-og-primary w-3 h-3" />
                </div>
              )}
              <span className="text-og-slate-500 text-sm">•</span>
              <span className="text-og-slate-500 text-sm">{formatTimeAgo(post.createdAt)}</span>
              {post.isAiRecommended && (
                <div className="ai-recommendation-badge">
                  <div className="w-3 h-3 gradient-brand rounded-full"></div>
                  <span className="text-xs">AI Recommended</span>
                </div>
              )}
            </div>
            
            <p className="text-og-slate-800 dark:text-og-slate-200 mb-4">
              {post.content}
            </p>

            {/* Media display for images and videos */}
            {post.imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden">
                {post.mediaType?.startsWith('video/') ? (
                  <video 
                    src={post.imageUrl} 
                    controls 
                    className="w-full max-h-80 object-cover" 
                  />
                ) : (
                  <img 
                    src={post.imageUrl} 
                    alt="Post media" 
                    className="w-full h-48 object-cover" 
                  />
                )}
              </div>
            )}

            {/* 0G Storage Verification Links */}
            {post.storageHash && post.transactionHash && (
              <div className="mb-3 p-3 bg-gradient-to-r from-og-slate-50 to-green-50 dark:from-og-slate-800 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    ✅ Verified on 0G Storage Network
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-og-slate-600 dark:text-og-slate-400">Transaction:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-mono text-og-slate-700 dark:text-og-slate-300">
                        {post.transactionHash.slice(0, 8)}...{post.transactionHash.slice(-6)}
                      </span>
                      <a 
                        href={`https://chainscan-galileo.0g.ai/tx/${post.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-og-primary hover:text-og-primary/80 transition-colors"
                        title="View transaction on 0G Chain Explorer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-og-slate-600 dark:text-og-slate-400">Storage Hash:</span>
                    <span className="text-xs font-mono text-og-slate-700 dark:text-og-slate-300">
                      {post.storageHash.slice(0, 8)}...{post.storageHash.slice(-6)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Show when post is not stored on 0G with enhanced status */}
            {!post.storageHash && !post.transactionHash && (
              <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="animate-pulse">
                      <Database className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      0G Storage Upload Pending
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Post created locally. Upload to decentralized storage will retry automatically when network is available.
                    </p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></div>
                        Auto-retrying...
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryStorageMutation.mutate()}
                        disabled={retryStorageMutation.isPending}
                        className="h-6 px-2 text-xs text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                      >
                        {retryStorageMutation.isPending ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 mr-1" />
                        )}
                        Retry now
                      </Button>
                      <button 
                        className="text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
                        onClick={() => window.open('https://faucet.0g.ai', '_blank')}
                      >
                        Get 0G tokens
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.isLiked 
                      ? "text-red-500 hover:text-red-600" 
                      : "text-og-slate-600 dark:text-og-slate-400 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                  <span className="text-sm">{post.likesCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-og-slate-600 dark:text-og-slate-400 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.commentsCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => repostMutation.mutate()}
                  disabled={repostMutation.isPending}
                  className={`flex items-center space-x-2 transition-colors ${
                    post.isReposted 
                      ? "text-green-500 hover:text-green-600" 
                      : "text-og-slate-600 dark:text-og-slate-400 hover:text-green-500"
                  }`}
                >
                  <Share className={`w-4 h-4 ${post.isReposted ? "fill-current" : ""}`} />
                  <span className="text-sm">{post.sharesCount}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-slate-800 dark:hover:text-og-slate-200 transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
                
                {/* Blockchain Verification Button - only show if post is stored on blockchain */}
                {(post.storageHash || post.transactionHash) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                        title="Verify on Blockchain"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <BlockchainVerification 
                        storageHash={post.storageHash || undefined}
                        transactionHash={post.transactionHash || undefined}
                        postId={post.id}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
