import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, KeyRound, Mail, Shield } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRedeemActivationToken } from "../hooks/useQueries";
import { useTranslation } from "../i18n/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";

export default function ActivationPendingScreen() {
  const { identity } = useInternetIdentity();
  const redeemToken = useRedeemActivationToken();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState("");

  const principalId = identity?.getPrincipal().toString() || "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRedeemToken = () => {
    if (token.trim()) {
      redeemToken.mutate(token.trim());
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/Logo Pasar Digital Community.png"
            alt="Logo"
            className="h-12 w-12"
          />
          <div>
            <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">
              Pasar Digital Community
            </h1>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Anti-Theft Phone Registry
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-amber-200 dark:border-amber-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-2xl text-amber-900 dark:text-amber-100">
              {t("activation.pending.title")}
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              {t("activation.pending.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Principal ID Section */}
            <div className="space-y-2">
              <Label className="text-amber-900 dark:text-amber-100">
                {t("activation.pending.principalLabel")}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={principalId}
                  readOnly
                  className="font-mono text-sm bg-amber-50 dark:bg-gray-900 border-amber-200 dark:border-amber-900"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t("activation.pending.instructions")}
              </p>
            </div>

            {/* Token Redemption Section */}
            <div className="space-y-2">
              <Label
                htmlFor="token"
                className="text-amber-900 dark:text-amber-100"
              >
                {t("activation.pending.tokenLabel")}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600 dark:text-amber-400" />
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder={t("activation.pending.tokenPlaceholder")}
                    className="pl-10 bg-amber-50 dark:bg-gray-900 border-amber-200 dark:border-amber-900"
                  />
                </div>
                <Button
                  onClick={handleRedeemToken}
                  disabled={!token.trim() || redeemToken.isPending}
                  className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                  {redeemToken.isPending
                    ? t("activation.pending.redeeming")
                    : t("activation.pending.redeemButton")}
                </Button>
              </div>
            </div>

            {/* Contact Admin Alert */}
            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50">
              <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-900 dark:text-amber-100">
                {t("activation.pending.contactAdmin")}{" "}
                <a
                  href="mailto:pasardigital1@gmail.com"
                  className="font-medium text-amber-600 dark:text-amber-400 hover:underline"
                >
                  pasardigital1@gmail.com
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200 dark:border-amber-900 bg-white/50 dark:bg-gray-950/50 backdrop-blur p-4 text-center text-sm text-amber-700 dark:text-amber-300">
        <p>
          © {new Date().getFullYear()} Pasar Digital Community. Built with ❤️
          using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-amber-600 dark:text-amber-400 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
