import { Github, Twitter, Globe, Heart, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-og-slate-800 border-t border-og-slate-200 dark:border-og-slate-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">0G</span>
              </div>
              <h3 className="text-xl font-bold gradient-text">0G Social</h3>
            </div>
            <p className="text-og-slate-600 dark:text-og-slate-400 text-sm">
              Platform media sosial terdesentralisasi pertama dengan AI yang dimiliki pengguna. 
              Dibangun di atas infrastruktur 0G Chain untuk masa depan Web3.
            </p>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-og-primary" />
              <span className="text-sm text-og-slate-600 dark:text-og-slate-400">
                100% Terdesentralisasi & Aman
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-og-slate-900 dark:text-og-slate-100">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Jelajahi
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Rekomendasi AI
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Komunitas
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  API Developer
                </a>
              </li>
            </ul>
          </div>

          {/* 0G Chain Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-og-slate-900 dark:text-og-slate-100">0G Chain</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://0g.ai" target="_blank" rel="noopener noreferrer" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Website Resmi
                </a>
              </li>
              <li>
                <a href="https://docs.0g.ai" target="_blank" rel="noopener noreferrer" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Dokumentasi
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Newton Testnet
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Staking
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Validator
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Community */}
          <div className="space-y-4">
            <h4 className="font-semibold text-og-slate-900 dark:text-og-slate-100">Dukungan</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Pusat Bantuan
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Panduan Pengguna
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Syarat Layanan
                </a>
              </li>
              <li>
                <a href="#" className="text-og-slate-600 dark:text-og-slate-400 hover:text-og-primary transition-colors">
                  Status Sistem
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Network Stats Bar */}
        <div className="mt-8 pt-8 border-t border-og-slate-200 dark:border-og-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-og-slate-600 dark:text-og-slate-400">Status: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3 text-og-secondary" />
                <span className="text-og-slate-600 dark:text-og-slate-400">24.7K Pengguna Aktif</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-3 h-3 text-red-500" />
                <span className="text-og-slate-600 dark:text-og-slate-400">1.2M Post Hari Ini</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-og-slate-200 dark:border-og-slate-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-og-slate-600 dark:text-og-slate-400">
            <p>© 2025 0G Social. Dibangun dengan ❤️ untuk masa depan Web3 yang terdesentralisasi.</p>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <span>Powered by 0G Chain</span>
              <div className="w-4 h-4 gradient-brand rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}