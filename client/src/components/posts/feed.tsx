import { useState } from "react";
import { Brain, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostCard } from "./post-card";
import type { PostWithAuthor } from "@shared/schema";

export function Feed() {
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const { data: posts, isLoading, error, refetch } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts/feed", limit, offset],
    queryFn: async () => {
      const response = await fetch(`/api/posts/feed?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    staleTime: 0, // Always consider data stale for immediate refresh
    cacheTime: 0, // Don't cache for immediate updates
  });

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-og-slate-600 dark:text-og-slate-400">
          Failed to load posts. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Feed Status */}
      <Card className="bg-gradient-to-r from-purple-100 to-green-100 dark:from-purple-900 dark:to-green-900 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <Brain className="text-white w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-og-primary">AI-Powered Feed Active</h3>
              <p className="text-sm text-og-slate-600 dark:text-og-slate-400">
                Your personalized content is being curated by 0G AI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-og-primary" />
          <p className="text-og-slate-600 dark:text-og-slate-400 mt-2">Loading your feed...</p>
        </div>
      ) : (
        <>
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          
          {posts && posts.length > 0 && (
            <div className="text-center py-6">
              <Button
                onClick={loadMore}
                variant="outline"
                className="px-6 py-3 bg-white dark:bg-og-slate-800 border border-og-slate-200 dark:border-og-slate-700 rounded-xl hover:shadow-md transition-all"
              >
                Load More Posts
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
