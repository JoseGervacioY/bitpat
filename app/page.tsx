"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/lib/i18n/language-context";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Spinner className="mx-auto h-10 w-10" />
        <p className="mt-4 text-muted-foreground">{t.common.loadingApp}</p>
      </div>
    </div>
  );
}
