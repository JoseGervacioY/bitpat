"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { formatPrice } from "@/lib/crypto/api";
import { Search } from "lucide-react";

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

interface AddCoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCoinDialog({ open, onOpenChange, onSuccess }: AddCoinDialogProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<"search" | "details">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<SearchResult | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [amount, setAmount] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("search");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedCoin(null);
      setAmount("");
      setPurchasePrice("");
    }
  }, [open]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/crypto/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.coins || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectCoin = async (coin: SearchResult) => {
    setSelectedCoin(coin);
    setStep("details");

    // Fetch current price
    try {
      const res = await fetch(`/api/crypto?ids=${coin.id}`);
      const data = await res.json();
      if (data?.[0]?.current_price) {
        setCurrentPrice(data[0].current_price);
        setPurchasePrice(data[0].current_price.toString());
      }
    } catch {
      console.error("Failed to fetch price");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoin) return;

    setIsLoading(true);

    const payload = {
      coinId: selectedCoin.id || "",
      coinName: selectedCoin.name || "",
      coinSymbol: (selectedCoin.symbol || "").toUpperCase(),
      amount: Number(amount) || 0,
      purchasePrice: Number(purchasePrice) || 0,
    };

    console.log("DEBUG - Sending payload:", payload);

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(t.portfolio.addSuccess.replace('{amount}', amount).replace('{coin}', selectedCoin.name));
        onOpenChange(false);
        onSuccess?.();
      } else {
        const data = await res.json();
        toast.error(data.error || t.portfolio.failedAdd);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.portfolio.addAsset}</DialogTitle>
          <DialogDescription>
            {step === "search"
              ? t.portfolio.searchCoins
              : t.portfolio.enterDetails.replace('{coin}', selectedCoin?.name || '')}
          </DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.portfolio.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => handleSelectCoin(coin)}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                    >
                      <Image
                        src={coin.thumb}
                        alt={coin.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-medium">{coin.name}</p>
                        <p className="text-sm text-muted-foreground uppercase">
                          {coin.symbol}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <p className="py-8 text-center text-muted-foreground">
                  {t.portfolio.noCoinsFound}
                </p>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  {t.portfolio.startTyping}
                </p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {selectedCoin && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted p-3">
                <Image
                  src={selectedCoin.thumb}
                  alt={selectedCoin.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">{selectedCoin.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.market.currentPrice}: {formatPrice(currentPrice)}
                  </p>
                </div>
              </div>
            )}

            <FieldGroup className="py-4">
              <Field>
                <FieldLabel>{t.portfolio.amount}</FieldLabel>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>{t.portfolio.purchasePrice} (USD)</FieldLabel>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("search")}
              >
                {t.portfolio.back}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
                {t.common.add}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
