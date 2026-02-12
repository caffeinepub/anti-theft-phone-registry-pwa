import { Outlet, Link, useLocation } from '@tanstack/react-router';
import { Home, Smartphone, AlertTriangle, Search, Bell, BarChart3, Info, User, Shield } from 'lucide-react';
import { useGetNotifications, useIsCurrentUserAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n/useTranslation';

export default function MainLayout() {
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCurrentUserAdmin();
  const { data: notifications = [] } = useGetNotifications(identity?.getPrincipal());
  const { t } = useTranslation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    { path: '/', icon: Home, label: t('tabs.home') },
    { path: '/phones', icon: Smartphone, label: t('tabs.phones') },
    { path: '/report-lost', icon: AlertTriangle, label: t('tabs.report') },
    { path: '/check', icon: Search, label: t('tabs.check') },
    { path: '/notifications', icon: Bell, label: t('tabs.notifications'), badge: unreadCount },
    { path: '/statistics', icon: BarChart3, label: t('tabs.statistics') },
    { path: '/about', icon: Info, label: t('tabs.about') },
    { path: '/profile', icon: User, label: t('tabs.profile') },
  ];

  // Add admin tab if user is admin
  if (isAdmin) {
    tabs.push({ path: '/admin', icon: Shield, label: t('tabs.admin') });
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/Logo Pasar Digital Community.png" 
            alt="Logo" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-lg font-bold">Pasar Digital Community</h1>
            <p className="text-xs text-muted-foreground">Anti-Theft Phone Registry</p>
          </div>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="border-t bg-background">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`relative flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px]">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute right-1/4 top-1 h-4 min-w-4 px-1 text-[10px]"
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
