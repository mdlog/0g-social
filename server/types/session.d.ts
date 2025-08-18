import "express-session";

declare module "express-session" {
  interface SessionData {
    walletConnection?: {
      connected: boolean;
      address: string | null;
      balance: string | null;
      network: string | null;
      chainId: string | null;
    };
  }
}