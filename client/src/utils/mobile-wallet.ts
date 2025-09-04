// Mobile wallet detection and handling utilities

export function isMobileBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile user agents
  const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
  
  // Check for touch capabilities
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size
  const isMobileScreen = window.innerWidth <= 768;
  
  return isMobileUserAgent || (hasTouchScreen && isMobileScreen);
}

export function isMetaMaskMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if we're in MetaMask mobile browser
  const ethereum = (window as any).ethereum;
  return !!(ethereum?.isMetaMask && isMobileBrowser());
}

export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || '';
  
  // Common in-app browser patterns
  const inAppPatterns = [
    'FBAN', // Facebook
    'FBAV', // Facebook
    'Instagram',
    'Twitter',
    'Line/',
    'WhatsApp',
    'LinkedInApp',
    'Telegram',
    'wv' // WebView indicator
  ];
  
  return inAppPatterns.some(pattern => userAgent.includes(pattern));
}

export async function connectWalletMobile(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('Window not available');
  }

  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    // On mobile, if MetaMask is not available, redirect to MetaMask mobile
    if (isMobileBrowser()) {
      const currentUrl = encodeURIComponent(window.location.href);
      const metamaskUrl = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
      
      // Try to open MetaMask app, fallback to install page
      window.location.href = metamaskUrl;
      
      // Show helpful message
      throw new Error('Opening MetaMask mobile app. If MetaMask is not installed, you will be redirected to install it.');
    }
    
    throw new Error('MetaMask not found. Please install MetaMask browser extension.');
  }

  try {
    // Request account access
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }

    // Get network info
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    
    return {
      address: accounts[0],
      chainId,
      connected: true
    };
    
  } catch (error: any) {
    console.error('[Mobile Wallet] Connection error:', error);
    
    if (error.code === 4001) {
      throw new Error('Connection rejected by user');
    }
    
    if (error.code === -32002) {
      throw new Error('Connection request already pending. Please check MetaMask.');
    }
    
    throw error;
  }
}

export async function signMessageMobile(message: string): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Window not available');
  }

  const ethereum = (window as any).ethereum;
  
  if (!ethereum) {
    throw new Error('MetaMask not available');
  }

  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    
    if (!accounts || accounts.length === 0) {
      throw new Error('Wallet not connected');
    }

    const signature = await ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]]
    });

    return signature;
    
  } catch (error: any) {
    console.error('[Mobile Wallet] Signing error:', error);
    
    if (error.code === 4001) {
      throw new Error('Signature rejected by user');
    }
    
    throw error;
  }
}