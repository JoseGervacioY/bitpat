"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatPrice, formatCurrency } from "@/lib/crypto/api";

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
}

interface AssetWithValue extends PortfolioItem {
  currentValue: number;
  percentage: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TopAssets() {
  const { t } = useLanguage();
  const [assets, setAssets] = useState<AssetWithValue[]>([]);

  const { data: portfolioData, isLoading: isLoadingPortfolio } = useSWR<{
    portfolio: PortfolioItem[];
  }>("/api/portfolio", fetcher);

  const { data: cryptoData, isLoading: isLoadingCrypto } = useSWR<CryptoData[]>(
    portfolioData?.portfolio?.length
      ? `/api/crypto?ids=${portfolioData.portfolio.map((p) => p.coin_id).join(",")}`
      : null,
    fetcher
  );

  useEffect(() => {
    if (portfolioData?.portfolio && Array.isArray(cryptoData)) {
      const portfolio = portfolioData.portfolio;
      const prices = cryptoData;

      const assetsWithValue = portfolio.map((item) => {
        const crypto = prices.find((c) => c.id === item.coin_id);
        const currentValue = crypto ? item.amount * crypto.current_price : 0;
        return { ...item, currentValue, percentage: 0 };
      });

      const totalValue = assetsWithValue.reduce((sum, a) => sum + a.currentValue, 0);

      const withPercentage = assetsWithValue
        .map((a) => ({
          ...a,
          percentage: totalValue > 0 ? (a.currentValue / totalValue) * 100 : 0,
        }))
        .sort((a, b) => b.currentValue - a.currentValue)
        .slice(0, 5);

      setAssets(withPercentage);
    }
  }, [portfolioData, cryptoData]);


  const isLoading = isLoadingPortfolio || isLoadingCrypto;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t.dashboard.topAssets}</CardTitle>
        <Link href="/portfolio" className="text-sm text-primary hover:underline">
          {t.common.viewAll}
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : assets.length ? (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{asset.coin_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {asset.amount.toFixed(4)} {t.portfolio.coins}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(asset.currentValue)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {asset.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress value={asset.percentage} className="h-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            {t.dashboard.noAssetsInPortfolio}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
