import { Zap, Github, Twitter, Globe, Shield, Database, Cpu } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-purple-500/20 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg gradient-cyber-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold gradient-neon-text">0G Social</h3>
                <p className="text-xs text-cyan-400/80">Decentralized Network</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform media sosial terdesentralisasi pertama yang dibangun di atas infrastruktur 0G Chain dengan penyimpanan on-chain yang sepenuhnya transparan.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-cyan-300">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-cyan-300 transition-colors">
                  Home Feed
                </Link>
              </li>
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-cyan-300 transition-colors">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/communities" className="text-gray-400 hover:text-cyan-300 transition-colors">
                  Communities
                </Link>
              </li>
              <li>
                <Link href="/ai-recommendations" className="text-gray-400 hover:text-cyan-300 transition-colors">
                  AI Recommendations
                </Link>
              </li>
            </ul>
          </div>

          {/* 0G Infrastructure */}
          <div className="space-y-4">
            <h4 className="font-semibold text-green-300">0G Infrastructure</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">0G Storage</span>
              </li>
              <li className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">0G Compute</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400">0G DA</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400">0G Chain</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-magenta-300">Community</h4>
            <div className="flex space-x-3">
              <a
                href="https://github.com/0glabs"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/0G_labs"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://0g.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
              >
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs text-gray-500">
              Join the decentralized revolution
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-xs text-gray-500">
            © 2025 0G Social. Built on 0G Chain infrastructure.
          </p>
          <div className="flex space-x-6 text-xs">
            <a href="#" className="text-gray-500 hover:text-cyan-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-cyan-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-cyan-300 transition-colors">
              Documentation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}