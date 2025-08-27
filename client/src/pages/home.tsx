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
        {/* Top Navigation Bar */}
        <div className="mb-6">
          <LeftSidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2 order-2 lg:order-1">
            <CreatePost />
            <Feed />
          </main>
          
          <aside className="order-1 lg:order-2">
            <RightSidebar />
          </aside>
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
