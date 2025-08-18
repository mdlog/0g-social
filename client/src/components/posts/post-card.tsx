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

            {/* 0G Storage Hash Display */}
            {post.storageHash && (
              <div className="flex items-center space-x-2 mb-3 p-2 bg-og-slate-100 dark:bg-og-slate-800 rounded-lg">
                <Database className="w-4 h-4 text-og-primary" />
                <span className="text-xs text-og-slate-600 dark:text-og-slate-400">
                  Stored on 0G:
                </span>
                <code className="text-xs font-mono text-og-slate-700 dark:text-og-slate-300 truncate">
                  {post.storageHash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-og-slate-500 hover:text-og-primary"
                  onClick={() => {
                    if (post.storageHash) {
                      window.open(`/api/zg/storage/content/${post.storageHash}`, '_blank');
                    }
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
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
