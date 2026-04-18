"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { useAuth } from "@/lib/auth/auth-context";
import { useLanguage } from "@/lib/i18n/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { PortfolioChart } from "@/components/dashboard/portfolio-chart";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TopAssets } from "@/components/dashboard/top-assets";
import { TrendingUp, TrendingDown, Wallet, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/crypto/api";

interface PortfolioItem {
  id: number;
  coin_id: string;
  coin_name: string;
  amount: number;
  purchase_price: number;
}

interface CryptoData {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [totalGains, setTotalGains] = useState(0);

  const { data: portfolioData, isLoading: isLoadingPortfolio } = useSWR(
    "/api/portfolio",
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: cryptoData, isLoading: isLoadingCrypto } = useSWR(
    portfolioData?.portfolio?.length
      ? `/api/crypto?ids=${portfolioData.portfolio.map((p: PortfolioItem) => p.coin_id).join(",")}`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (portfolioData?.portfolio && Array.isArray(cryptoData)) {
      const portfolio = portfolioData.portfolio as PortfolioItem[];
      const prices = cryptoData as CryptoData[];

      let totalValue = 0;
      let totalCost = 0;
      let weightedChange = 0;

      portfolio.forEach((item) => {
        const crypto = prices.find((c) => c.id === item.coin_id);
        if (crypto) {
          const value = item.amount * crypto.current_price;
          const cost = item.amount * item.purchase_price;
          totalValue += value;
          totalCost += cost;
          weightedChange += (crypto.price_change_percentage_24h * value);
        }
      });

      setPortfolioValue(totalValue);
      setTotalGains(totalValue - totalCost);
      setPortfolioChange(totalValue > 0 ? weightedChange / totalValue : 0);
    }
  }, [portfolioData, cryptoData]);


  const isLoading = isLoadingPortfolio || isLoadingCrypto;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          {t.dashboard.welcome}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          {t.dashboard.title}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.totalValue}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(portfolioValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {portfolioData?.portfolio?.length || 0} {t.portfolio.coins}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.totalGains}
            </CardTitle>
            {totalGains >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${
                    totalGains >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {totalGains >= 0 ? "+" : ""}
                  {formatCurrency(totalGains)}
                </div>
                <p className="text-xs text-muted-foreground">{t.dashboard.allTime}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.todayChange}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <>
                <div
                  className={`text-2xl font-bold ${
                    portfolioChange >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {portfolioChange >= 0 ? "+" : ""}
                  {portfolioChange.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">{t.dashboard.last24h}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.dashboard.topAssets}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {portfolioData?.portfolio?.[0]?.coin_name || "—"}
                </div>
                <p className="text-xs text-muted-foreground">{t.dashboard.topHolding}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioChart />
        <MarketOverview />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopAssets />
        <RecentTransactions />
      </div>
    </div>
  );
}
