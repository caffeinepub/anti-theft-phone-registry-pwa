import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "next-themes";
import ActivationPendingScreen from "../components/ActivationPendingScreen";
import AdminRecoveryScreen from "../components/AdminRecoveryScreen";
import ProfileSetupModal from "../components/ProfileSetupModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAccessState,
  useGetCallerUserProfile,
  useHasUserAccess,
} from "../hooks/useQueries";
import { useTranslation } from "../i18n/useTranslation";
import LoginPage from "../pages/LoginPage";

export default function RootRoute() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: hasAccess, isLoading: accessLoading } = useHasUserAccess();
  const { data: accessState, isLoading: accessStateLoading } =
    useGetAccessState();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const { t } = useTranslation();

  const isAuthenticated = !!identity;

  // Show splash screen with logo during initialization
  if (
    isInitializing ||
    (isAuthenticated && (accessLoading || accessStateLoading))
  ) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="text-center">
            <img
              src="/assets/Logo Pasar Digital Community.png"
              alt="Pasar Digital Community Logo"
              className="mx-auto mb-6 h-32 w-32 animate-pulse"
            />
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-600 dark:text-amber-400" />
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
              {t("app.loading")}
            </p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LoginPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show admin recovery screen if user is not activated and no admin exists
  if (
    hasAccess === false &&
    accessState?.isAdmin === false &&
    accessState?.isUser === false
  ) {
    // Check if requiresInvite is true, which means no admin exists (bootstrap scenario)
    // In the current backend, when no admin exists, the system allows the first user to claim admin
    // We detect this by checking if the user has no access and is not an admin
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AdminRecoveryScreen />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show activation pending screen if user is not activated but admin exists
  if (hasAccess === false) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ActivationPendingScreen />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup modal if user is authenticated and activated but has no profile
  const showProfileSetup =
    isAuthenticated &&
    hasAccess &&
    !profileLoading &&
    isFetched &&
    userProfile === null;

  // User is fully authenticated, activated, and has profile - render routed content
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="h-screen overflow-hidden bg-background">
        {showProfileSetup ? <ProfileSetupModal /> : <Outlet />}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
