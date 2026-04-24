"use client";

import { getLocalizedDescription } from "@/lib/utils/translation-utility";
import { useState, useEffect, use } from "react";
import { useTheme } from "next-themes";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, formatCurrency, formatPercentage } from "@/lib/crypto/api";
import { ArrowLeft, TrendingUp, TrendingDown, Plus } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from "recharts";
import { AddToPortfolioDialog } from "@/components/portfolio/add-to-portfolio-dialog";

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { large: string };
  description: { en: string; es?: string; [key: string]: string | undefined };
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

interface PriceHistory {
  prices: [number, number][];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
];

export default function CoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Theme-aware colors
  const chartColors = {
    text: isDark ? "#FFFFFF" : "#000000",
    axes: isDark ? "#9CA3AF" : "#6B7280",
    grid: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    tooltipBg: isDark ? "#1F2937" : "#FFFFFF",
    tooltipBorder: isDark ? "#374151" : "#E5E7EB",
    tooltipText: isDark ? "#FFFFFF" : "#000000",
  };

  const { id } = use(params);
  const { t, language } = useLanguage();
  const [selectedRange, setSelectedRange] = useState(7);
  const [chartData, setChartData] = useState<{ time: string; price: number; isSpecial?: boolean }[]>([]);
  const [chartStats, setChartStats] = useState<{ min: number; max: number; minIdx: number; maxIdx: number } | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Pass the active language so the API route can request localized descriptions
  const { data: coinData, isLoading: isLoadingCoin } = useSWR<CoinDetail>(
    `/api/crypto/${id}?lang=${language}`,
    fetcher
  );

  const { data: historyData, isLoading: isLoadingHistory } = useSWR<PriceHistory>(
    `/api/crypto/${id}?type=history&days=${selectedRange}`,
    fetcher
  );

  // Locale string for date formatting
  const dateLocale = language === "es" ? "es-ES" : "en-US";

  useEffect(() => {
    if (historyData?.prices) {
      const formatted = historyData.prices.map(([timestamp, price]) => ({
        time: new Date(timestamp).toLocaleDateString(dateLocale, {
          month: "short",
          day: "numeric",
          ...(selectedRange <= 1 && { hour: "numeric" }),
        }),
        price: price,
        isSpecial: false,
      }));

      const step = Math.max(1, Math.floor(formatted.length / 60));
      const sampled: { time: string; price: number; isSpecial: boolean }[] = formatted.filter((_, i) => i % step === 0);

      if (sampled.length > 0) {
        const prices = sampled.map((d) => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minIdx = sampled.findIndex((d) => d.price === minPrice);
        const maxIdx = sampled.findIndex((d) => d.price === maxPrice);

        sampled[0].isSpecial = true;
        sampled[sampled.length - 1].isSpecial = true;
        if (minIdx >= 0) sampled[minIdx].isSpecial = true;
        if (maxIdx >= 0) sampled[maxIdx].isSpecial = true;

        setChartStats({ min: minPrice, max: maxPrice, minIdx, maxIdx });
      }

      setChartData(sampled);
    }
  }, [historyData, selectedRange, dateLocale]);

  const isLoading = isLoadingCoin;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!coinData || (coinData as any).error || !coinData.market_data) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">{t.market.coinNotFound}</p>
        <Link href="/market">
          <Button variant="link">{t.market.backToMarketBtn}</Button>
        </Link>
      </div>
    );
  }

  const priceChange = coinData.market_data.price_change_percentage_24h;
  const isPositive = priceChange >= 0;

  const description = getLocalizedDescription(coinData.description as any, language);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/market" className="inline-flex items-center text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.market.backToMarket}
      </Link>

      {/* Coin Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={coinData.image.large}
            alt={coinData.name}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{coinData.name}</h1>
              <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium uppercase">
                {coinData.symbol}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">
                {formatPrice(coinData.market_data.current_price.usd)}
              </span>
              <span
                className={`flex items-center text-lg ${
                  isPositive ? "text-success" : "text-destructive"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="mr-1 h-5 w-5" />
                ) : (
                  <TrendingDown className="mr-1 h-5 w-5" />
                )}
                {formatPercentage(priceChange)}
              </span>
            </div>
          </div>
        </div>

        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t.market.addToPortfolio}
        </Button>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.market.priceChart}</CardTitle>
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <Button
                key={range.days}
                variant={selectedRange === range.days ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedRange(range.days)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex h-[400px] items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <>
              {/* Stats siempre visibles */}
              {chartStats && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{t.market.currentPriceChart}</p>
                    <p className="text-sm font-bold">
                      {formatPrice(coinData?.market_data.current_price.usd ?? 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{t.market.periodHigh}</p>
                    <p className="text-sm font-bold text-success">
                      {formatPrice(chartStats.max)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{t.market.periodLow}</p>
                    <p className="text-sm font-bold text-destructive">
                      {formatPrice(chartStats.min)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{t.market.range}</p>
                    <p className="text-sm font-bold">
                      {(((chartStats.max - chartStats.min) / chartStats.min) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={chartData} margin={{ top: 24, right: 16, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="coinPriceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: chartColors.axes }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: chartColors.axes }}
                    tickLine={false}
                    axisLine={false}
                    domain={["auto", "auto"]}
                    tickFormatter={(value) =>
                      value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : `$${value.toFixed(2)}`
                    }
                    width={65}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      border: `1px solid ${chartColors.tooltipBorder}`,
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: chartColors.tooltipText,
                    }}
                    labelStyle={{ color: chartColors.tooltipText, fontWeight: 600 }}
                    itemStyle={{ color: chartColors.tooltipText }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      t.market.tooltipPrice,
                    ]}
                  />
                  {/* Línea de referencia al precio actual */}
                  {coinData && (
                    <ReferenceLine
                      y={coinData.market_data.current_price.usd}
                      stroke="hsl(var(--primary))"
                      strokeDasharray="5 4"
                      strokeOpacity={0.7}
                      label={{
                        value: formatPrice(coinData.market_data.current_price.usd),
                        position: "right",
                        fontSize: 11,
                        fontWeight: 700,
                        fill: "hsl(var(--primary))",
                      }}
                    />
                  )}
                  {/* Línea de precio máximo */}
                  {chartStats && (
                    <ReferenceLine
                      y={chartStats.max}
                      stroke="hsl(var(--success))"
                      strokeDasharray="3 4"
                      strokeOpacity={0.4}
                      label={{
                        value: `${t.market.refMax}: ${chartStats.max >= 1000 ? `$${(chartStats.max / 1000).toFixed(1)}K` : `$${chartStats.max.toFixed(0)}`}`,
                        position: "insideTopRight",
                        fontSize: 10,
                        fill: "hsl(var(--success))",
                      }}
                    />
                  )}
                  {/* Línea de precio mínimo */}
                  {chartStats && (
                    <ReferenceLine
                      y={chartStats.min}
                      stroke="hsl(var(--destructive))"
                      strokeDasharray="3 4"
                      strokeOpacity={0.4}
                      label={{
                        value: `${t.market.refMin}: ${chartStats.min >= 1000 ? `$${(chartStats.min / 1000).toFixed(1)}K` : `$${chartStats.min.toFixed(0)}`}`,
                        position: "insideBottomRight",
                        fontSize: 10,
                        fill: "hsl(var(--destructive))",
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                    strokeWidth={2}
                    fill="url(#coinPriceGradient)"
                    dot={(dotProps) => {
                      const { cx, cy, payload } = dotProps;
                      if (!payload?.isSpecial || cx === undefined || cy === undefined)
                        return <g key={`dot-${dotProps.index}`} />;
                      return (
                        <circle
                          key={`dot-${dotProps.index}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                          stroke="hsl(var(--background))"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  >
                    <LabelList
                      dataKey="price"
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      content={(props: any) => {
                        const x = typeof props.x === "number" ? props.x : undefined;
                        const y = typeof props.y === "number" ? props.y : undefined;
                        const value = typeof props.value === "number" ? props.value : undefined;
                        const index = typeof props.index === "number" ? props.index : undefined;
                        if (x === undefined || y === undefined || value === undefined || index === undefined) return null;
                        if (!chartData[index]?.isSpecial) return null;
                        const formatted =
                          value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(0)}`;
                        return (
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight={600}
                            fill={chartColors.text}
                          >
                            {formatted}
                          </text>
                        );
                      }}
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}
        </CardContent>
      </Card>

      {/* Market Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.market.marketCap}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(coinData.market_data.market_cap.usd)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.market.volume24h}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(coinData.market_data.total_volume.usd)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.market.highLow24h}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              <span className="text-success">
                {formatPrice(coinData.market_data.high_24h.usd)}
              </span>
              {" / "}
              <span className="text-destructive">
                {formatPrice(coinData.market_data.low_24h.usd)}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t.market.circulatingSupply}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {coinData.market_data.circulating_supply.toLocaleString(dateLocale, {
                maximumFractionDigits: 0,
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Changes */}
      <Card>
        <CardHeader>
          <CardTitle>{t.market.pricePerformance}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t.market.change24h}</p>
              <p
                className={`text-xl font-bold ${
                  coinData.market_data.price_change_percentage_24h >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {formatPercentage(coinData.market_data.price_change_percentage_24h)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t.market.change7d}</p>
              <p
                className={`text-xl font-bold ${
                  coinData.market_data.price_change_percentage_7d >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {formatPercentage(coinData.market_data.price_change_percentage_7d)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t.market.change30d}</p>
              <p
                className={`text-xl font-bold ${
                  coinData.market_data.price_change_percentage_30d >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {formatPercentage(coinData.market_data.price_change_percentage_30d)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description — in the active language */}
      {description && (
        <Card>
          <CardHeader>
            <CardTitle>{t.market.about} {coinData.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: description.split(". ").slice(0, 3).join(". ") + ".",
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Add to Portfolio Dialog */}
      <AddToPortfolioDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        coin={{
          id: coinData.id,
          name: coinData.name,
          symbol: coinData.symbol,
          currentPrice: coinData.market_data.current_price.usd,
        }}
      />
    </div>
  );
}
