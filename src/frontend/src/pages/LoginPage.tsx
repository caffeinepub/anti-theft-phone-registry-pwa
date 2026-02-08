import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Smartphone, Search, AlertTriangle } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from '../i18n/useTranslation';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const { t } = useTranslation();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Language Switcher */}
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>

        {/* Hero Section with Logo */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <img 
              src="/assets/Logo Pasar Digital Community.png" 
              alt="Pasar Digital Community Logo" 
              className="h-24 w-24 rounded-full shadow-lg"
            />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {t('login.title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-12 grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <Smartphone className="mx-auto mb-3 h-10 w-10 text-blue-600" />
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{t('login.features.register.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('login.features.register.description')}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-600" />
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{t('login.features.report.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('login.features.report.description')}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <Search className="mx-auto mb-3 h-10 w-10 text-green-600" />
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{t('login.features.check.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('login.features.check.description')}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
            <Shield className="mx-auto mb-3 h-10 w-10 text-purple-600" />
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{t('login.features.secure.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('login.features.secure.description')}
            </p>
          </div>
        </div>

        {/* Login Button */}
        <div className="w-full max-w-md">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg font-semibold shadow-xl hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t('login.loggingIn')}
              </>
            ) : (
              t('login.loginButton')
            )}
          </Button>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('login.secureLogin')}
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{t('footer.copyright')}</p>
        </footer>
      </div>
    </div>
  );
}
