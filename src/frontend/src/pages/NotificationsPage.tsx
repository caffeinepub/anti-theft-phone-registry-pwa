import { useGetNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Info, AlertTriangle, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { NotificationType } from '../backend';

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useGetNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.success:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NotificationType.info:
        return <Info className="h-5 w-5 text-blue-500" />;
      case NotificationType.warning:
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case NotificationType.success:
        return 'border-l-green-500';
      case NotificationType.info:
        return 'border-l-blue-500';
      case NotificationType.warning:
        return 'border-l-orange-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Notifikasi</h1>
              <p className="mt-1 text-sm text-blue-100">
                {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
              </p>
            </div>
            <img 
              src="/assets/generated/notification-bell-icon-transparent.dim_64x64.png" 
              alt="Notification Icon" 
              className="h-12 w-12"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {unreadCount > 0 && (
          <Button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="mb-4 w-full"
            variant="outline"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Tandai Semua Sudah Dibaca
          </Button>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Belum ada notifikasi
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id.toString()}
                className={`border-l-4 shadow-md transition-all hover:shadow-lg ${getBorderColor(notification.notifType)} ${
                  !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-1">{getIcon(notification.notifType)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        {!notification.isRead && (
                          <Badge variant="default" className="flex-shrink-0 text-xs">
                            Baru
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                      {notification.relatedIMEI && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          IMEI: {notification.relatedIMEI}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead.mutate(notification.id)}
                            disabled={markAsRead.isPending}
                            className="h-7 text-xs"
                          >
                            Tandai Dibaca
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
