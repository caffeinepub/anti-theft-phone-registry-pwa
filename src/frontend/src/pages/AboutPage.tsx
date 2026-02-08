import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Database, CheckCircle, Mail } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/Logo Pasar Digital Community.png" 
              alt="Pasar Digital Community Logo" 
              className="h-12 w-12 rounded-full bg-white p-1"
            />
            <div>
              <h1 className="text-2xl font-bold">{t('about.title')}</h1>
              <p className="mt-1 text-sm text-green-100">{t('about.subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Purpose Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              {t('about.purpose.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p dangerouslySetInnerHTML={{ __html: t('about.purpose.description') }} />
            <p>{t('about.purpose.intro')}</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>{t('about.purpose.features.register')}</li>
              <li>{t('about.purpose.features.check')}</li>
              <li>{t('about.purpose.features.report')}</li>
              <li>{t('about.purpose.features.transfer')}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              {t('about.blockchain.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p dangerouslySetInnerHTML={{ __html: t('about.blockchain.description') }} />
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-purple-50 p-4 dark:bg-purple-950/30">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                <div>
                  <p className="font-semibold text-foreground">{t('about.blockchain.benefits.tamperProof.title')}</p>
                  <p className="text-sm">{t('about.blockchain.benefits.tamperProof.description')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="font-semibold text-foreground">{t('about.blockchain.benefits.transparent.title')}</p>
                  <p className="text-sm">{t('about.blockchain.benefits.transparent.description')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-950/30">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="font-semibold text-foreground">{t('about.blockchain.benefits.secure.title')}</p>
                  <p className="text-sm">{t('about.blockchain.benefits.secure.description')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              {t('about.dataProtection.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>{t('about.dataProtection.description')}</p>
            <ul className="ml-6 list-disc space-y-2">
              <li dangerouslySetInnerHTML={{ __html: t('about.dataProtection.features.encryption') }} />
              <li dangerouslySetInnerHTML={{ __html: t('about.dataProtection.features.anonymization') }} />
              <li dangerouslySetInnerHTML={{ __html: t('about.dataProtection.features.control') }} />
              <li dangerouslySetInnerHTML={{ __html: t('about.dataProtection.features.noThirdParty') }} />
            </ul>
          </CardContent>
        </Card>

        {/* Key Features Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>{t('about.keyFeatures.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="mb-2 font-semibold text-foreground">{t('about.keyFeatures.register.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('about.keyFeatures.register.description')}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="mb-2 font-semibold text-foreground">{t('about.keyFeatures.transfer.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('about.keyFeatures.transfer.description')}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="mb-2 font-semibold text-foreground">{t('about.keyFeatures.check.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('about.keyFeatures.check.description')}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <h3 className="mb-2 font-semibold text-foreground">{t('about.keyFeatures.notifications.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('about.keyFeatures.notifications.description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mb-6 border-blue-200 bg-blue-50 shadow-lg dark:border-blue-900 dark:bg-blue-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Mail className="h-5 w-5" />
              {t('about.help.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 dark:text-blue-200">
            <p className="mb-2">{t('about.help.description')}</p>
            <a 
              href="mailto:pasardigital1@gmail.com"
              className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Mail className="h-4 w-4" />
              pasardigital1@gmail.com
            </a>
          </CardContent>
        </Card>

        {/* Developer Credit */}
        <Card className="mb-6 border-green-200 bg-green-50 shadow-lg dark:border-green-900 dark:bg-green-950/30">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-green-800 dark:text-green-200">
              {t('about.developer.label')}
            </p>
            <p className="mt-1 text-xl font-bold text-green-900 dark:text-green-100">
              Lucky Zamaludin Malik
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
        </footer>
      </div>
    </div>
  );
}
