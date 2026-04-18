export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { large: string; small: string; thumb: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
}

export interface PriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function getTopCryptos(limit: number = 50): Promise<CryptoData[]> {
  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) {
      throw new Error("Failed to fetch crypto data");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching top cryptos:", error);
    return [];
  }
}

export async function getCoinDetail(coinId: string): Promise<CoinDetail | null> {
  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { next: { revalidate: 60 } }
    );
    
    if (!res.ok) {
      throw new Error("Failed to fetch coin details");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching coin detail:", error);
    return null;
  }
}

export async function getPriceHistory(coinId: string, days: number = 7): Promise<PriceHistory | null> {
  try {
    const res = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
      { next: { revalidate: 300 } }
    );
    
    if (!res.ok) {
      throw new Error("Failed to fetch price history");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching price history:", error);
    return null;
  }
}

export async function searchCoins(query: string): Promise<{ id: string; name: string; symbol: string; thumb: string }[]> {
  try {
    const res = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`,
      { next: { revalidate: 300 } }
    );
    
    if (!res.ok) {
      throw new Error("Failed to search coins");
    }
    
    const data = await res.json();
    return data.coins?.slice(0, 50) || [];
  } catch (error) {
    console.error("Error searching coins:", error);
    return [];
  }
}

export function formatCurrency(value: number, decimals: number = 2): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(decimals)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(decimals)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(decimals)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(decimals)}K`;
  } else {
    return `$${value.toFixed(decimals)}`;
  }
}

export function formatPrice(price: number): string {
  if (price >= 1) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`;
  } else {
    return `$${price.toFixed(8)}`;
  }
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null) return "0.00%";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
