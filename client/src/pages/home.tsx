import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Footer } from "@/components/layout/footer";
import { Feed } from "@/components/posts/feed";
import { CreatePost } from "@/components/posts/create-post";
import { ZGInfrastructureStatus } from "@/components/zg-infrastructure/zg-status";
import { MobileNavigation } from "@/components/mobile-navigation";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <LeftSidebar />
          
          <main className="col-span-1 lg:col-span-9 xl:col-span-6">
            <CreatePost />
            <Feed />
          </main>
          
          <RightSidebar />
        </div>
      </div>

      {/* 0G Infrastructure Status - Bottom Section - Hidden on mobile */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-og-slate-50 dark:bg-og-slate-900/50">
        <ZGInfrastructureStatus />
      </div>

      <Footer />

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Mobile bottom padding to avoid navigation overlap */}
      <div className="h-16 lg:hidden"></div>

      {/* Floating Create Post (Mobile) */}
      <Button
        size="icon"
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 gradient-brand text-white rounded-full shadow-lg hover:shadow-xl transition-all lg:hidden z-50"
      >
        <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>
    </div>
  );
}
