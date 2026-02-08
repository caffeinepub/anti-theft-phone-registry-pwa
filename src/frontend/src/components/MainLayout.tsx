import { useState, useEffect } from 'react';
import { Home, Smartphone, AlertTriangle, Search, Bell, BarChart3, User, Info, CheckCircle, Shield } from 'lucide-react';
import HomePage from '../pages/HomePage';
import MyPhonesPage from '../pages/MyPhonesPage';
import ReportLostPage from '../pages/ReportLostPage';
import ReportFoundPage from '../pages/ReportFoundPage';
import CheckImeiPage from '../pages/CheckImeiPage';
import NotificationsPage from '../pages/NotificationsPage';
import StatisticsPage from '../pages/StatisticsPage';
import ProfilePage from '../pages/ProfilePage';
import AboutPage from '../pages/AboutPage';
import AdminInviteManagementPage from '../pages/AdminInviteManagementPage';
import NotificationPopup from './NotificationPopup';
import LanguageSwitcher from './LanguageSwitcher';
import { useGetNotifications, useGetAccessState } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '../i18n/useTranslation';

type TabType = 'home' | 'myphones' | 'report-lost' | 'report-found' | 'check' | 'notifications' | 'statistics' | 'profile' | 'about' | 'admin-invites';

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { data: notifications = [] } = useGetNotifications();
  const { data: accessState } = useGetAccessState();
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const { t } = useTranslation();

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isAdmin = accessState?.isAdmin || false;

  useEffect(() => {
    if (notifications.length > previousNotificationCount && previousNotificationCount > 0) {
      const newest = notifications[0];
      setLatestNotification(newest);
      setShowPopup(true);
    }
    setPreviousNotificationCount(notifications.length);
  }, [notifications.length]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'myphones':
        return <MyPhonesPage />;
      case 'report-lost':
        return <ReportLostPage />;
      case 'report-found':
        return <ReportFoundPage />;
      case 'check':
        return <CheckImeiPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'statistics':
        return <StatisticsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'about':
        return <AboutPage />;
      case 'admin-invites':
        return <AdminInviteManagementPage />;
      default:
        return <HomePage />;
    }
  };

  const tabs = [
    { id: 'home' as TabType, label: t('tabs.home'), icon: Home },
    { id: 'myphones' as TabType, label: t('tabs.phones'), icon: Smartphone },
    { 
      id: 'report-lost' as TabType, 
      label: t('tabs.report'), 
      icon: AlertTriangle,
      hasDropdown: true,
      dropdownItems: [
        { id: 'report-lost' as TabType, label: t('tabs.reportLost'), icon: AlertTriangle },
        { id: 'report-found' as TabType, label: t('tabs.reportFound'), icon: CheckCircle },
      ]
    },
    { id: 'check' as TabType, label: t('tabs.check'), icon: Search },
    { id: 'notifications' as TabType, label: t('tabs.notifications'), icon: Bell, badge: unreadCount },
    { id: 'statistics' as TabType, label: t('tabs.statistics'), icon: BarChart3 },
    { id: 'about' as TabType, label: t('tabs.about'), icon: Info },
    { id: 'profile' as TabType, label: t('tabs.profile'), icon: User },
  ];

  // Add admin tab if user is admin
  if (isAdmin) {
    tabs.splice(tabs.length - 1, 0, { id: 'admin-invites' as TabType, label: t('tabs.admin'), icon: Shield });
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header with Logo */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 shadow-sm">
        <img 
          src="/assets/Logo Pasar Digital Community.png" 
          alt="Pasar Digital Community Logo" 
          className="h-10 w-10 rounded-full"
        />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Pasar Digital Community</h1>
          <p className="text-xs text-muted-foreground">Anti-Pencurian Ponsel</p>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-around overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.hasDropdown && tab.dropdownItems?.some(item => item.id === activeTab));

            if (tab.hasDropdown && tab.dropdownItems) {
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="relative">
                        <Icon className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} />
                      </div>
                      <span className="text-xs font-medium">{tab.label}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" side="top" className="mb-2">
                    {tab.dropdownItems.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className="cursor-pointer"
                        >
                          <ItemIcon className="mr-2 h-4 w-4" />
                          {item.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 flex-col items-center gap-1 py-3 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Notification Popup */}
      {showPopup && latestNotification && (
        <NotificationPopup
          notification={latestNotification}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
