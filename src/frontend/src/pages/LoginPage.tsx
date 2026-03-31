import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Search, Shield, Smartphone } from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useTranslation } from "../i18n/useTranslation";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { t } = useTranslation();

  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error("Login error:", error);
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
        <div className="w-full max-w-4xl space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 shadow-lg">
              <Shield className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-4xl font-bold text-amber-900 dark:text-amber-100">
              {t("login.title")}
            </h2>
            <p className="text-lg text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">
              {t("login.subtitle")}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-amber-200 dark:border-amber-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
              <CardHeader className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Smartphone className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
                  {t("login.feature1Title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  {t("login.feature1Desc")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
              <CardHeader className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
                  {t("login.feature2Title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  {t("login.feature2Desc")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
              <CardHeader className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Search className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
                  {t("login.feature3Title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  {t("login.feature3Desc")}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
              <CardHeader className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
                  {t("login.feature4Title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-amber-700 dark:text-amber-300">
                  {t("login.feature4Desc")}
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Login Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600 px-8 py-6 text-lg font-semibold shadow-lg"
            >
              {isLoggingIn ? t("login.loggingIn") : t("login.button")}
            </Button>
          </div>
        </div>
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
