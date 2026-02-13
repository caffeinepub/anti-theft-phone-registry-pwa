import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useHasUserAccess } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Outlet } from '@tanstack/react-router';
import LoginPage from './pages/LoginPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import ActivationPendingScreen from './components/ActivationPendingScreen';
import { Loader2 } from 'lucide-react';
import { useTranslation } from './i18n/useTranslation';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: hasAccess, isLoading: accessLoading } = useHasUserAccess();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { t } = useTranslation();

  const isAuthenticated = !!identity;

  // Show splash screen with logo during initialization
  if (isInitializing || (isAuthenticated && accessLoading)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <img 
              src="/assets/Logo Pasar Digital Community.png" 
              alt="Pasar Digital Community Logo" 
              className="mx-auto mb-6 h-32 w-32 animate-pulse"
            />
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-sm text-muted-foreground">{t('app.loading')}</p>
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

  // Show activation pending screen if user is not activated
  if (hasAccess === false) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ActivationPendingScreen />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup modal if user is authenticated and activated but has no profile
  const showProfileSetup = isAuthenticated && hasAccess && !profileLoading && isFetched && userProfile === null;

  // User is fully authenticated, activated, and has profile - render routed content
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="h-screen overflow-hidden bg-background">
        {showProfileSetup ? (
          <ProfileSetupModal />
        ) : (
          <Outlet />
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
