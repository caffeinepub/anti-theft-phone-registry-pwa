import { useEffect } from 'react';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Notification } from '../backend';
import { NotificationType } from '../backend';

interface NotificationPopupProps {
  notification: Notification;
  onClose: () => void;
}

export default function NotificationPopup({ notification, onClose }: NotificationPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (notification.notifType) {
      case NotificationType.success:
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case NotificationType.info:
        return <Info className="h-6 w-6 text-blue-500" />;
      case NotificationType.warning:
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.notifType) {
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

  return (
    <div className="fixed right-4 top-4 z-[100] animate-in slide-in-from-top-5">
      <Card className={`w-80 border-l-4 shadow-2xl ${getBorderColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{notification.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
              {notification.relatedIMEI && (
                <p className="mt-2 text-xs text-muted-foreground">IMEI: {notification.relatedIMEI}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
