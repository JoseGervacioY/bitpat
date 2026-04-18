"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, formatCurrency, formatPercentage } from "@/lib/crypto/api";
import { Search, ArrowUpRight, ArrowDownRight, Star } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";


interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MarketPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<CryptoData[]>([]);

  const { data, isLoading } = useSWR<CryptoData[]>(
    "/api/crypto?limit=50",
    fetcher,
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (data) {
      if (searchQuery) {
        const filtered = data.filter(
          (crypto) =>
            crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredData(filtered);
      } else {
        setFilteredData(data);
      }
    }
  }, [data, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.market.title}</h1>
          <p className="text-muted-foreground">
            {t.market.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.market.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Market Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">{t.market.rank}</TableHead>
                    <TableHead>{t.market.name}</TableHead>
                    <TableHead className="text-right">{t.market.price}</TableHead>
                    <TableHead className="text-right">{t.market.change24h}</TableHead>
                    <TableHead className="text-right hidden md:table-cell">
                      {t.market.marketCap}
                    </TableHead>
                    <TableHead className="text-right hidden lg:table-cell">
                      {t.market.volume}
                    </TableHead>
                    <TableHead className="w-32 hidden lg:table-cell">{t.market.chart7d}</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((crypto) => (
                    <TableRow key={crypto.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {crypto.market_cap_rank}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/market/${crypto.id}`}
                          className="flex items-center gap-3 hover:underline"
                        >
                          <Image
                            src={crypto.image}
                            alt={crypto.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-medium">{crypto.name}</p>
                            <p className="text-sm text-muted-foreground uppercase">
                              {crypto.symbol}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(crypto.current_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`flex items-center justify-end ${
                            crypto.price_change_percentage_24h >= 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {crypto.price_change_percentage_24h >= 0 ? (
                            <ArrowUpRight className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-4 w-4" />
                          )}
                          {formatPercentage(crypto.price_change_percentage_24h)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        {formatCurrency(crypto.market_cap)}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">
                        {formatCurrency(crypto.total_volume)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {crypto.sparkline_in_7d?.price && (
                          <ResponsiveContainer width={100} height={40}>
                            <LineChart
                              data={crypto.sparkline_in_7d.price.map((p, i) => ({
                                value: p,
                                index: i,
                              }))}
                            >
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={
                                  crypto.price_change_percentage_24h >= 0
                                    ? "hsl(var(--success))"
                                    : "hsl(var(--destructive))"
                                }
                                strokeWidth={1.5}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/market/${crypto.id}`}>
                          <Button variant="outline" size="sm">
                            {t.market.viewDetails}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
