import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Smartphone, Download, ExternalLink } from "lucide-react";
import { isMobileBrowser } from "@/utils/mobile-wallet";

interface WalletInstructionCardProps {
  onTryAgain?: () => void;
}

export function WalletInstructionCard({ onTryAgain }: WalletInstructionCardProps) {
  const isMobile = isMobileBrowser();

  if (isMobile) {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Smartphone className="w-5 h-5" />
            Mobile Wallet Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            To use DeSocialAI on mobile, you need a Web3 wallet:
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-blue-900/40 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">1</span>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Install MetaMask Mobile</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Download from App Store or Google Play</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download MetaMask
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-blue-900/40 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">2</span>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Open in MetaMask Browser</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Use the built-in browser in MetaMask app</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-blue-900/40 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-300 font-bold text-sm">3</span>
              </div>
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-200">Connect Your Wallet</div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Tap "Connect Wallet" button again</div>
              </div>
            </div>
          </div>

          {onTryAgain && (
            <Button onClick={onTryAgain} className="w-full">
              <Wallet className="w-4 h-4 mr-2" />
              Try Connecting Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Wallet className="w-5 h-5" />
          Wallet Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700 dark:text-orange-300">
          You need a Web3 wallet to use DeSocialAI:
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
          >
            <Download className="w-4 h-4 mr-2" />
            Install MetaMask Extension
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('https://walletconnect.com/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Learn about WalletConnect
          </Button>
        </div>

        {onTryAgain && (
          <Button onClick={onTryAgain} className="w-full">
            <Wallet className="w-4 h-4 mr-2" />
            Try Connecting Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}