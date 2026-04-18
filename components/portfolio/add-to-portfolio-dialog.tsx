"use client";

import { useState } from "react";
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

interface AddToPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coin: {
    id: string;
    name: string;
    currentPrice: number;
  };
  onSuccess?: () => void;
}

export function AddToPortfolioDialog({
  open,
  onOpenChange,
  coin,
  onSuccess,
}: AddToPortfolioDialogProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(coin.currentPrice.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinId: coin.id,
          coinName: coin.name,
          amount: parseFloat(amount),
          purchasePrice: parseFloat(purchasePrice),
        }),
      });

      if (res.ok) {
        toast.success(t.portfolio.addSuccess.replace('{amount}', amount).replace('{coin}', coin.name));
        onOpenChange(false);
        setAmount("");
        setPurchasePrice(coin.currentPrice.toString());
        onSuccess?.();
      } else {
        const data = await res.json();
        toast.error(data.error || t.portfolio.failedAdd);
      }
    } catch {
      toast.error(t.common.unexpectedError);
    } finally {
      setIsLoading(false);
    }
  };

  const totalValue = parseFloat(amount || "0") * parseFloat(purchasePrice || "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t.market.addToPortfolio}: {coin.name}
          </DialogTitle>
          <DialogDescription>
            {t.market.currentPrice}: {formatPrice(coin.currentPrice)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
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

          {amount && purchasePrice && (
            <div className="mb-4 rounded-lg bg-muted p-3 text-center">
              <p className="text-sm text-muted-foreground">{t.portfolio.totalValue}</p>
              <p className="text-xl font-bold">{formatPrice(totalValue)}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
              {t.common.add}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
