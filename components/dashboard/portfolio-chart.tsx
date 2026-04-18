"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/language-context";
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const timeRanges = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
];

// Custom dot that shows only on first, last, min, max
function CustomDot(props: {
  cx?: number;
  cy?: number;
  index?: number;
  dataLength?: number;
  isSpecial?: boolean;
  stroke?: string;
}) {
  const { cx, cy, isSpecial, stroke } = props;
  if (!isSpecial || cx === undefined || cy === undefined) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={stroke || "hsl(var(--primary))"}
      stroke="hsl(var(--background))"
      strokeWidth={2}
    />
  );
}

export function PortfolioChart() {
  const { t, language } = useLanguage();
  const dateLocale = language === "es" ? "es-ES" : "en-US";
  const [selectedRange, setSelectedRange] = useState(7);
  const [chartData, setChartData] = useState<
    { time: string; price: number; isSpecial?: boolean }[]
  >([]);
  const [stats, setStats] = useState<{
    current: number;
    min: number;
    max: number;
    change: number;
  } | null>(null);

  const { data, isLoading } = useSWR(
    `/api/crypto/bitcoin?type=history&days=${selectedRange}`,
    fetcher,
    { refreshInterval: 300000 }
  );

  useEffect(() => {
    if (data?.prices) {
      const formatted = data.prices.map(([timestamp, price]: [number, number]) => ({
        time: new Date(timestamp).toLocaleDateString(dateLocale, {
          month: "short",
          day: "numeric",
          ...(selectedRange <= 1 && { hour: "numeric" }),
        }),
        price: price,
        isSpecial: false,
      }));

      const step = Math.max(1, Math.floor(formatted.length / 50));
      const sampled = formatted.filter((_: unknown, i: number) => i % step === 0);

      if (sampled.length > 0) {
        const prices = sampled.map((d: { price: number }) => d.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const minIdx = sampled.findIndex((d: { price: number }) => d.price === minPrice);
        const maxIdx = sampled.findIndex((d: { price: number }) => d.price === maxPrice);

        // Mark special points: first, last, min, max
        sampled[0].isSpecial = true;
        sampled[sampled.length - 1].isSpecial = true;
        sampled[minIdx].isSpecial = true;
        sampled[maxIdx].isSpecial = true;

        const firstPrice = sampled[0].price;
        const lastPrice = sampled[sampled.length - 1].price;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;

        setStats({ current: lastPrice, min: minPrice, max: maxPrice, change });
      }

      setChartData(sampled);
    }
  }, [data, selectedRange]);

  const isPositive = (stats?.change ?? 0) >= 0;

  // Custom label for special points (min, max, first, last)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const x = typeof props.x === "number" ? props.x : undefined;
    const y = typeof props.y === "number" ? props.y : undefined;
    const value = typeof props.value === "number" ? props.value : undefined;
    const index = typeof props.index === "number" ? props.index : undefined;
    if (x === undefined || y === undefined || value === undefined || index === undefined) return null;
    if (!chartData[index]?.isSpecial) return null;
    const formatted = value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(0)}`;
    return (
      <text
        x={x}
        y={y - 10}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        fill="hsl(var(--foreground))"
      >
        {formatted}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t.dashboard.priceChart}</CardTitle>
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
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            {/* Stats bar */}
            {stats && (
              <div className="mb-4 grid grid-cols-4 gap-3">
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t.dashboard.currentPrice}</p>
                  <p className="text-sm font-bold">
                    ${stats.current >= 1000
                      ? `${(stats.current / 1000).toFixed(2)}K`
                      : stats.current.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t.dashboard.max}</p>
                  <p className="text-sm font-bold text-success">
                    ${stats.max >= 1000
                      ? `${(stats.max / 1000).toFixed(2)}K`
                      : stats.max.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t.dashboard.min}</p>
                  <p className="text-sm font-bold text-destructive">
                    ${stats.min >= 1000
                      ? `${(stats.min / 1000).toFixed(2)}K`
                      : stats.min.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{t.dashboard.change}</p>
                  <p
                    className={`text-sm font-bold ${
                      isPositive ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {stats.change.toFixed(2)}%
                  </p>
                </div>
              </div>
            )}

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"
                      }
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"
                      }
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    `$${value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toFixed(0)}`
                  }
                  domain={["auto", "auto"]}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    t.market.price,
                  ]}
                />
                {/* Reference line at current price */}
                {stats && (
                  <ReferenceLine
                    y={stats.current}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{
                      value: `$${stats.current >= 1000 ? `${(stats.current / 1000).toFixed(1)}K` : stats.current.toFixed(0)}`,
                      position: "right",
                      fontSize: 11,
                      fontWeight: 700,
                      fill: "hsl(var(--primary))",
                    }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={(dotProps) => {
                    const { key, ...restDotProps } = dotProps;
                    return (
                      <CustomDot
                        key={key}
                        {...restDotProps}
                        isSpecial={restDotProps.payload?.isSpecial}
                        stroke={isPositive ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                      />
                    );
                  }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                >
                  <LabelList
                    dataKey="price"
                    content={renderCustomLabel}
                  />
                </Area>
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
