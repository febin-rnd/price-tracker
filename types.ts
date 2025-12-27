
export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface Product {
  id: string;
  url: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  currency: string;
  targetPrice: number;
  history: PricePoint[];
  platform: 'Amazon' | 'Flipkart' | 'eBay' | 'Other';
  lastUpdated: number;
  lastChecked: number;
  nextCheck: number;
  isDeal: boolean;
  status: 'active' | 'paused' | 'archived';
  category?: string;
  sentiment?: 'buy' | 'wait' | 'lowest';
}

export interface ScrapingResult {
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  platform: 'Amazon' | 'Flipkart' | 'eBay' | 'Other';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  ALERTS = 'ALERTS',
  SETTINGS = 'SETTINGS'
}
