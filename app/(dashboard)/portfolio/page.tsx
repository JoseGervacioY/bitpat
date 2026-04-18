"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { formatPrice, formatCurrency, formatPercentage } from "@/lib/crypto/api";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { EditPortfolioDialog } from "@/components/portfolio/edit-portfolio-dialog";
import { AddCoinDialog } from "@/components/portfolio/add-coin-dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PortfolioItem {
  id: number;
  coin_id: string;
  coin_name: string;
  amount: number;
  purchase_price: number;
}

interface CryptoData {
  id: string;
  image: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface EnrichedPortfolioItem extends PortfolioItem {
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  priceChange24h: number;
  image: string;
  symbol: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PortfolioPage() {
  const { t } = useLanguage();
  const [enrichedPortfolio, setEnrichedPortfolio] = useState<EnrichedPortfolioItem[]>([]);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<PortfolioItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: portfolioData, isLoading: isLoadingPortfolio } = useSWR<{
    portfolio: PortfolioItem[];
  }>("/api/portfolio", fetcher, { refreshInterval: 30000 });

  const { data: cryptoData, isLoading: isLoadingCrypto } = useSWR<CryptoData[]>(
    portfolioData?.portfolio?.length
      ? `/api/crypto?ids=${portfolioData.portfolio.map((p) => p.coin_id).join(",")}`
      : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (portfolioData?.portfolio && Array.isArray(cryptoData)) {
      const enriched = portfolioData.portfolio.map((item) => {
        const crypto = cryptoData.find((c) => c.id === item.coin_id);
        const currentPrice = crypto?.current_price || 0;
        const currentValue = item.amount * currentPrice;
        const costBasis = item.amount * item.purchase_price;
        const profitLoss = currentValue - costBasis;
        const profitLossPercentage = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

        return {
          ...item,
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercentage,
          priceChange24h: crypto?.price_change_percentage_24h || 0,
          image: crypto?.image || "",
          symbol: crypto?.symbol || "",
        };
      });

      setEnrichedPortfolio(enriched.sort((a, b) => b.currentValue - a.currentValue));
    }
  }, [portfolioData, cryptoData]);


  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/portfolio/${deletingItem.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t.portfolio.removeSuccess.replace('{coin}', deletingItem.coin_name));
        mutate("/api/portfolio");
      } else {
        toast.error(t.portfolio.failedRemove);
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const isLoading = isLoadingPortfolio || isLoadingCrypto;

  const totalValue = enrichedPortfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const totalCost = enrichedPortfolio.reduce(
    (sum, item) => sum + item.amount * item.purchase_price,
    0
  );
  const totalProfitLoss = totalValue - totalCost;
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.portfolio.title}</h1>
          <p className="text-muted-foreground">
            {t.portfolio.subtitle}
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t.portfolio.addAsset}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.portfolio.totalValue}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.portfolio.totalProfitLoss}</CardTitle>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <div
                className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-success" : "text-destructive"
                  }`}
              >
                {totalProfitLoss >= 0 ? "+" : ""}
                {formatCurrency(totalProfitLoss)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.portfolio.totalReturn}</CardTitle>
            {totalProfitLossPercentage >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <div
                className={`text-2xl font-bold ${totalProfitLossPercentage >= 0 ? "text-success" : "text-destructive"
                  }`}
              >
                {formatPercentage(totalProfitLossPercentage)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.portfolio.myAssets}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : enrichedPortfolio.length === 0 ? (
            <Empty className="py-12">
              <EmptyMedia variant="icon">
                <Wallet className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>{t.portfolio.noAssets}</EmptyTitle>
              <EmptyDescription>{t.portfolio.startAdding}</EmptyDescription>
              <EmptyContent>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t.portfolio.addAsset}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.portfolio.coin}</TableHead>
                    <TableHead className="text-right">{t.portfolio.amount}</TableHead>
                    <TableHead className="text-right">{t.portfolio.purchasePrice}</TableHead>
                    <TableHead className="text-right">{t.portfolio.currentPrice}</TableHead>
                    <TableHead className="text-right">{t.portfolio.value}</TableHead>
                    <TableHead className="text-right">{t.portfolio.profitLoss}</TableHead>
                    <TableHead className="text-right">{t.portfolio.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedPortfolio.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.coin_name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.coin_name}</p>
                            <p className="text-sm text-muted-foreground uppercase">
                              {item.symbol}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.amount.toFixed(6)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.purchase_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p>{formatPrice(item.currentPrice)}</p>
                          <p
                            className={`text-xs ${item.priceChange24h >= 0
                                ? "text-success"
                                : "text-destructive"
                              }`}
                          >
                            {formatPercentage(item.priceChange24h)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.currentValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p
                            className={`font-medium ${item.profitLoss >= 0
                                ? "text-success"
                                : "text-destructive"
                              }`}
                          >
                            {item.profitLoss >= 0 ? "+" : ""}
                            {formatCurrency(item.profitLoss)}
                          </p>
                          <p
                            className={`text-xs ${item.profitLossPercentage >= 0
                                ? "text-success"
                                : "text-destructive"
                              }`}
                          >
                            {formatPercentage(item.profitLossPercentage)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletingItem(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingItem && (
        <EditPortfolioDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onSuccess={() => {
            setEditingItem(null);
            mutate("/api/portfolio");
          }}
        />
      )}

      {/* Add Coin Dialog */}
      <AddCoinDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => mutate("/api/portfolio")}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.portfolio.deleteAsset}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.portfolio.deleteConfirm.replace('{coin}', deletingItem?.coin_name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
