import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Footer } from "@/components/layout/footer";
import { Feed } from "@/components/posts/feed";
import { CreatePost } from "@/components/posts/create-post";
import { ZGInfrastructureStatus } from "@/components/zg-infrastructure/zg-status";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <LeftSidebar />
          
          <main className="lg:col-span-6">
            {/* Top Friends Bar */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 overflow-x-auto">
                {[
                  { name: "Sarah", avatar: "S" },
                  { name: "John", avatar: "J" },
                  { name: "Maria", avatar: "M" },
                  { name: "Patrick", avatar: "P" },
                  { name: "David", avatar: "D" },
                  { name: "Chris", avatar: "C" }
                ].map((friend, index) => (
                  <div key={index} className="flex flex-col items-center space-y-1 cursor-pointer group">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-105 transition-transform">
                      {friend.avatar}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{friend.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <CreatePost />
            <Feed />
          </main>
          
          <RightSidebar />
        </div>
      </div>

      <Footer />

      {/* Floating Create Post (Mobile) */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 w-14 h-14 gradient-brand text-white rounded-full shadow-lg hover:shadow-xl transition-all lg:hidden"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
