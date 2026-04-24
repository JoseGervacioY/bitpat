"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  Globe,
  Zap,
  Clock,
  PieChart,
  Wallet,
  Newspaper,
  ExternalLink,
  Blocks,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

// News data with translation keys
const newsData = [
  {
    id: 1,
    titleKey: "bitcoinTitle",
    descKey: "bitcoinDesc",
    date: "2026-03-25",
    categoryKey: "bitcoin",
  },
  {
    id: 2,
    titleKey: "ethereumTitle",
    descKey: "ethereumDesc",
    date: "2026-03-24",
    categoryKey: "ethereum",
  },
  {
    id: 3,
    titleKey: "adoptionTitle",
    descKey: "adoptionDesc",
    date: "2026-03-23",
    categoryKey: "adoption",
  },
];

export default function HomePage() {
  const { t, language } = useLanguage();

  const { data: cryptoData, isLoading } = useSWR<CryptoData[]>(
    "/api/crypto?limit=4",
    fetcher,
    { refreshInterval: 60000 }
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 md:p-12 lg:p-16">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-chart-2/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center lg:flex-row lg:text-left lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              BITPAT
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg text-muted-foreground text-pretty md:text-xl">
              {t.home.heroSubtitle}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button size="lg" asChild className="group">
                <Link href="/market">
                  {t.home.exploreMarket}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#learn-more">
                  {t.home.learnMore}
                </a>
              </Button>
            </div>
          </div>
          
          {/* Hero Illustration - Crypto Icons */}
          <div className="mt-10 lg:mt-0">
            <div className="relative h-64 w-64 md:h-80 md:w-80">
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/30 to-chart-2/30 blur-2xl" />
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 shadow-2xl ring-1 ring-border/50 backdrop-blur-sm">
                <Image
                  src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
                  alt="Bitcoin"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </div>
              <div className="absolute left-4 top-8 flex h-16 w-16 items-center justify-center rounded-full bg-card/80 shadow-xl ring-1 ring-border/50 backdrop-blur-sm">
                <Image
                  src="https://assets.coingecko.com/coins/images/279/large/ethereum.png"
                  alt="Ethereum"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </div>
              <div className="absolute right-4 top-12 flex h-14 w-14 items-center justify-center rounded-full bg-card/80 shadow-xl ring-1 ring-border/50 backdrop-blur-sm">
                <Image
                  src="https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
                  alt="BNB"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              </div>
              <div className="absolute bottom-12 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-card/80 shadow-xl ring-1 ring-border/50 backdrop-blur-sm">
                <Image
                  src="https://assets.coingecko.com/coins/images/4128/large/solana.png"
                  alt="Solana"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <div className="absolute bottom-8 right-12 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 shadow-xl ring-1 ring-border/50 backdrop-blur-sm">
                <Image
                  src="https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
                  alt="XRP"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What are Cryptocurrencies */}
      <section id="learn-more" className="scroll-mt-20 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t.home.whatAreCryptos}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground text-pretty">
            {t.home.whatAreCryptosDesc}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Decentralization */}
          <Card className="group border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <CardContent className="p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{t.home.decentralization}</h3>
              <p className="mt-2 text-muted-foreground text-pretty">
                {t.home.decentralizationDesc}
              </p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="group border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-chart-2/30 hover:shadow-lg hover:shadow-chart-2/5">
            <CardContent className="p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-chart-2/10 transition-colors group-hover:bg-chart-2/20">
                <Blocks className="h-7 w-7 text-chart-2" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{t.home.security}</h3>
              <p className="mt-2 text-muted-foreground text-pretty">
                {t.home.securityDesc}
              </p>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card className="group border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-chart-4/30 hover:shadow-lg hover:shadow-chart-4/5">
            <CardContent className="p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-chart-4/10 transition-colors group-hover:bg-chart-4/20">
                <Zap className="h-7 w-7 text-chart-4" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{t.home.accessibility}</h3>
              <p className="mt-2 text-muted-foreground text-pretty">
                {t.home.accessibilityDesc}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t.home.benefitsTitle}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Growth Potential */}
          <Card className="border-border/50 bg-gradient-to-br from-success/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="mt-4 font-semibold">{t.home.growthPotential}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                {t.home.growthPotentialDesc}
              </p>
            </CardContent>
          </Card>

          {/* 24/7 Market */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{t.home.market247}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                {t.home.market247Desc}
              </p>
            </CardContent>
          </Card>

          {/* Diversification */}
          <Card className="border-border/50 bg-gradient-to-br from-chart-4/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/10">
                <PieChart className="h-6 w-6 text-chart-4" />
              </div>
              <h3 className="mt-4 font-semibold">{t.home.diversification}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                {t.home.diversificationDesc}
              </p>
            </CardContent>
          </Card>

          {/* Financial Freedom */}
          <Card className="border-border/50 bg-gradient-to-br from-chart-5/5 to-transparent">
            <CardContent className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10">
                <Wallet className="h-6 w-6 text-chart-5" />
              </div>
              <h3 className="mt-4 font-semibold">{t.home.financialFreedom}</h3>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">
                {t.home.financialFreedomDesc}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* News Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              {t.home.newsTitle}
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {newsData.map((news) => (
            <Card key={news.id} className="group border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {t.news.categories[news.categoryKey as keyof typeof t.news.categories]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(news.date)}</span>
                </div>
                <CardTitle className="mt-2 line-clamp-2 text-lg">
                  {t.news[news.titleKey as keyof typeof t.news] as string}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 text-pretty">
                  {t.news[news.descKey as keyof typeof t.news] as string}
                </CardDescription>
                <Button variant="link" className="mt-4 h-auto p-0 text-primary">
                  {t.home.readMore}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Market Trends */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t.home.marketTrends}
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/market">
              {t.home.viewAll}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cryptoData?.map((coin) => (
              <Link key={coin.id} href={`/market/${coin.id}`}>
                <Card className="group cursor-pointer border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-border/50"
                        />
                        <div>
                          <p className="font-semibold">{coin.symbol.toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">{coin.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-lg font-bold">{formatPrice(coin.current_price)}</p>
                      <div
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium ${
                          coin.price_change_percentage_24h >= 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {coin.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-chart-2/20 p-8 md:p-12">
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-chart-2/20 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <Shield className="h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">
            {t.home.ctaTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground text-pretty md:text-lg">
            {t.home.ctaSubtitle}
          </p>

          {/* Motivational Tips */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3 w-full max-w-3xl">
            {/* Tip 1 */}
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{t.home.ctaTip1Title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{t.home.ctaTip1Desc}</p>
            </div>

            {/* Tip 2 */}
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-5 transition-all duration-300 hover:border-chart-2/30 hover:shadow-lg hover:shadow-chart-2/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chart-2/10">
                <Newspaper className="h-5 w-5 text-chart-2" />
              </div>
              <h3 className="font-semibold">{t.home.ctaTip2Title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{t.home.ctaTip2Desc}</p>
            </div>

            {/* Tip 3 */}
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-5 transition-all duration-300 hover:border-chart-4/30 hover:shadow-lg hover:shadow-chart-4/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chart-4/10">
                <Clock className="h-5 w-5 text-chart-4" />
              </div>
              <h3 className="font-semibold">{t.home.ctaTip3Title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{t.home.ctaTip3Desc}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
