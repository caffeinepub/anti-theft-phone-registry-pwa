import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetAccessState } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import LoginPage from './pages/LoginPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import InviteGate from './components/InviteGate';
import MainLayout from './components/MainLayout';
import { Loader2 } from 'lucide-react';
import { useTranslation } from './i18n/useTranslation';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: accessState, isLoading: accessLoading } = useGetAccessState();
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

  // Show invite gate if user requires invite
  if (accessState?.requiresInvite) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <InviteGate />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup modal if user is authenticated and has access but has no profile
  const showProfileSetup = isAuthenticated && accessState?.isUser && !profileLoading && isFetched && userProfile === null;

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="h-screen overflow-hidden bg-background">
        {showProfileSetup ? (
          <ProfileSetupModal />
        ) : (
          <MainLayout />
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
