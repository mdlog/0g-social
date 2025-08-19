import { Heart, MessageCircle, Share, Bookmark, Shield, Database, ExternalLink } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PostWithAuthor } from "@shared/schema";

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
          <div className={`w-10 h-10 ${getAvatarClass(post.authorId)} rounded-full flex-shrink-0`}></div>
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

            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt="Post image" 
                className="rounded-xl w-full h-48 object-cover mb-4" 
              />
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

            {/* Show when post is not stored on 0G */}
            {!post.storageHash && !post.transactionHash && (
              <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-yellow-700 dark:text-yellow-300">
                    ⚠️ Not stored on 0G Storage (upload failed or pending)
                  </span>
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
              <Button
                variant="ghost"
                size="sm"
                className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-slate-800 dark:hover:text-og-slate-200 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}
