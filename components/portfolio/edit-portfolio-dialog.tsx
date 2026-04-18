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

interface EditPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: number;
    coin_name: string;
    amount: number;
    purchase_price: number;
  };
  onSuccess?: () => void;
}

export function EditPortfolioDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: EditPortfolioDialogProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(item.amount.toString());
  const [purchasePrice, setPurchasePrice] = useState(item.purchase_price.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/portfolio/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          purchasePrice: parseFloat(purchasePrice),
        }),
      });

      if (res.ok) {
        toast.success(t.portfolio.updateSuccess.replace('{coin}', item.coin_name));
        onOpenChange(false);
        onSuccess?.();
      } else {
        const data = await res.json();
        toast.error(data.error || t.portfolio.failedUpdate);
      }
    } catch {
      toast.error(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t.portfolio.editAsset}: {item.coin_name}
          </DialogTitle>
          <DialogDescription>{t.portfolio.updateHoldings}</DialogDescription>
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
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
