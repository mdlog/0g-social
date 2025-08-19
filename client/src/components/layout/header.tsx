import { Search, Bell, MessageCircle, Zap, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl gradient-cyber-primary flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-neon-text">0G Social</h1>
              <p className="text-xs text-cyan-400/80">Decentralized Network</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search posts, users, topics..."
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 h-10"
              />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <Button variant="ghost" size="sm" className="md:hidden text-cyan-300/80 hover:text-cyan-300">
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative text-cyan-300/80 hover:text-cyan-300">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative text-cyan-300/80 hover:text-cyan-300">
              <MessageCircle className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-green-500 text-white text-xs flex items-center justify-center">
                2
              </Badge>
            </Button>

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="lg:hidden text-cyan-300/80 hover:text-cyan-300">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}