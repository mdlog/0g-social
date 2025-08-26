import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ContentSearch } from "@/components/discovery/content-search";
import { HashtagTrending } from "@/components/discovery/hashtag-trending";
import { AICategorization } from "@/components/discovery/ai-categorization";
import { Search, Hash, Brain, TrendingUp } from "lucide-react";

export function DiscoveryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Content Discovery Engine
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore decentralized content with AI-powered search, trending hashtags, and intelligent categorization across 0G Storage network
            </p>
          </div>

          {/* Discovery Tabs */}
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="w-full justify-start bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-1">
              <TabsTrigger 
                value="search" 
                className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
              >
                <Search className="w-4 h-4" />
                Smart Search
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
              >
                <TrendingUp className="w-4 h-4" />
                Trending Hashtags
              </TabsTrigger>
              <TabsTrigger 
                value="categorization" 
                className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
              >
                <Brain className="w-4 h-4" />
                AI Categorization
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="search" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <ContentSearch />
                  </div>
                  <div className="lg:col-span-1">
                    <HashtagTrending />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trending" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 xl:col-span-2">
                    <HashtagTrending />
                  </div>
                  <div className="lg:col-span-1">
                    <div className="space-y-6">
                      {/* Trending Stats */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          <div className="flex items-center gap-3 mb-2">
                            <Hash className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Active Hashtags</h3>
                          </div>
                          <div className="text-3xl font-bold">2,847</div>
                          <div className="text-blue-100 text-sm">+12% from yesterday</div>
                        </div>
                        
                        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                          <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Trending Topics</h3>
                          </div>
                          <div className="text-3xl font-bold">156</div>
                          <div className="text-green-100 text-sm">Across all categories</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="categorization" className="space-y-6">
                <AICategorization />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}