"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/language-context";
import { formatPrice } from "@/lib/crypto/api";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Transaction {
  id: number;
  coin_name: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  total_value: number;
  date: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RecentTransactions() {
  const { t, language } = useLanguage();
  const dateLocale = language === "es" ? "es-ES" : "en-US";

  const { data, isLoading } = useSWR<{ transactions: Transaction[] }>(
    "/api/transactions?limit=5",
    fetcher
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.dashboard.recentTransactions}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : data?.transactions?.length ? (
          <div className="space-y-4">
            {data.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      tx.type === "buy"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tx.type === "buy" ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === "buy" ? t.transactions.buy : t.transactions.sell}{" "}
                      {tx.coin_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString(dateLocale)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {tx.amount.toFixed(4)} {tx.coin_name.substring(0, 3).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(tx.total_value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            {t.transactions.noRecent}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
