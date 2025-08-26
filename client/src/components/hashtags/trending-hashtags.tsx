import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hash, TrendingUp, Users } from "lucide-react";
import type { TrendingHashtag } from "@shared/schema";

interface TrendingHashtagsProps {
  hashtags: TrendingHashtag[];
  onHashtagClick?: (hashtag: string) => void;
  onFollowToggle?: (hashtagId: string, isFollowing: boolean) => void;
}

export function TrendingHashtags({ hashtags, onHashtagClick, onFollowToggle }: TrendingHashtagsProps) {
  if (!hashtags.length) {
    return (
      <Card className="border-cyan-400/20 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>Trending Hashtags</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cyan-300/80 text-sm">No trending hashtags yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="border-cyan-400/20 bg-black/40 backdrop-blur-sm"
      data-testid="card-trending-hashtags"
    >
      <CardHeader>
        <CardTitle className="text-lg font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <span>Trending Hashtags</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hashtags.slice(0, 10).map((hashtag, index) => (
          <div
            key={hashtag.id}
            className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group"
            onClick={() => onHashtagClick?.(hashtag.name)}
            data-testid={`item-hashtag-${hashtag.id}`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Hash className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span 
                    className="font-semibold text-white truncate group-hover:text-cyan-300 transition-colors"
                    data-testid={`text-hashtag-name-${hashtag.id}`}
                  >
                    {hashtag.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-cyan-300/80">
                  <span data-testid={`text-posts-count-${hashtag.id}`}>
                    {hashtag.postsCount.toLocaleString()} posts
                  </span>
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span data-testid={`text-trending-score-${hashtag.id}`}>
                      {hashtag.trendingScore}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFollowToggle?.(hashtag.id, !hashtag.isFollowing);
              }}
              className={`ml-2 ${
                hashtag.isFollowing
                  ? 'text-cyan-400 hover:text-cyan-300'
                  : 'text-cyan-300/60 hover:text-cyan-400'
              }`}
              data-testid={`button-follow-hashtag-${hashtag.id}`}
            >
              <Users className="w-4 h-4" />
            </Button>
          </div>
        ))}
        
        {hashtags.length > 10 && (
          <Button 
            variant="ghost" 
            className="w-full text-cyan-400 hover:text-cyan-300 text-sm"
            data-testid="button-show-more-hashtags"
          >
            Show more trending topics
          </Button>
        )}
      </CardContent>
    </Card>
  );
}