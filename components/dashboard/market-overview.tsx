"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatPrice, formatPercentage } from "@/lib/crypto/api";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MarketOverview() {
  const { t } = useLanguage();

  const { data, isLoading } = useSWR<CryptoData[]>(
    "/api/crypto?limit=5",
    fetcher,
    { refreshInterval: 30000 }
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t.dashboard.marketOverview}</CardTitle>
        <Link
          href="/market"
          className="text-sm text-primary hover:underline"
        >
          {t.market.viewAll}
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="space-y-4">
            {data?.map((crypto) => (
              <Link
                key={crypto.id}
                href={`/market/${crypto.id}`}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={crypto.image}
                    alt={crypto.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{crypto.name}</p>
                    <p className="text-sm text-muted-foreground uppercase">
                      {crypto.symbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(crypto.current_price)}</p>
                  <p
                    className={`flex items-center justify-end text-sm ${
                      crypto.price_change_percentage_24h >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
