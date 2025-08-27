import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalAIFeed } from "@/components/personal-ai-feed";
import { TrendingHashtags } from "@/components/hashtags/trending-hashtags";

// Container component that fetches data for TrendingHashtags
function TrendingHashtagsContainer() {
  const { data: hashtags } = useQuery<Array<{
    id: string;
    name: string;
    postsCount: number;
    trendingScore: number;
    isFollowing: boolean;
    createdAt: Date | null;
  }>>({
    queryKey: ["/api/hashtags/trending"],
    refetchInterval: 300000, // 5 minutes
  });

  const handleHashtagClick = (hashtag: string) => {
    console.log("Clicked hashtag:", hashtag);
    // TODO: Navigate to hashtag page
  };

  const handleFollowToggle = async (hashtagId: string, isFollowing: boolean) => {
    console.log("Toggle follow:", hashtagId, isFollowing);
    // TODO: Implement hashtag follow/unfollow
  };

  return (
    <TrendingHashtags
      hashtags={hashtags || []}
      onHashtagClick={handleHashtagClick}
      onFollowToggle={handleFollowToggle}
    />
  );
}

export function RightSidebar() {
  const { data: trending } = useQuery<Array<{topic: string; posts: string}>>({
    queryKey: ["/api/ai/trending"],
    refetchInterval: 300000,
  });

  const { data: networkStats } = useQuery<{activeUsers: number; postsToday: number; aiInteractions: number; dataStored: string}>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const suggestedUsers = [
    {
      id: "suggested1",
      displayName: "0G Foundation",
      username: "0g_foundation",
      avatar: "indigo-purple",
      isFollowing: false,
    },
    {
      id: "suggested2",
      displayName: "DevRelAlice",
      username: "alice_dev", 
      avatar: "green-teal",
      isFollowing: false,
    },
    {
      id: "suggested3",
      displayName: "CryptoBuilder",
      username: "cryptobuild",
      avatar: "orange-red",
      isFollowing: false,
    },
  ];

  return (
    <aside className="lg:col-span-3">
      <div className="sticky top-24 space-y-4">
        {/* Recent Activity */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              {[
                { name: "Michel", action: "Followed on you", time: "3 min ago", avatar: "M", status: "Remove", color: "yellow" },
                { name: "Cristano", action: "Followed on you", time: "3 min ago", avatar: "C", status: "Remove", color: "yellow" },
                { name: "Brahim diaz", action: "Followed on you", time: "3 min ago", avatar: "B", status: "Remove", color: "yellow" },
                { name: "John wick", action: "Followed on you", time: "3 min ago", avatar: "J", status: "Remove", color: "yellow" },
                { name: "Abhilash Jose", action: "Followed on you", time: "3 min ago", avatar: "A", status: "Remove", color: "yellow" },
                { name: "George Jose", action: "Followed on you", time: "3 min ago", avatar: "G", status: "Remove", color: "yellow" }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.action} · {activity.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-xs px-2 py-1 bg-yellow-400 text-yellow-900 rounded font-medium hover:bg-yellow-500 transition-colors">
                          {activity.status}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
