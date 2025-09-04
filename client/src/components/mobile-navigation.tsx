import { Home, Bot, Users, Bookmark, Settings, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Bot, label: "AI Feed", href: "/ai-recommendations" },
  { icon: Users, label: "Communities", href: "/communities" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navigationItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-14 w-16 p-1 ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}