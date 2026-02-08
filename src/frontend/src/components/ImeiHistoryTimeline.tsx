import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Package, AlertTriangle, CheckCircle, UserCheck, FileText, Trash2, RefreshCw } from 'lucide-react';
import type { IMEIEvent, EventType } from '../backend';
import { EventType as EventTypeEnum } from '../backend';

interface ImeiHistoryTimelineProps {
  events: IMEIEvent[];
  isLoading?: boolean;
}

export default function ImeiHistoryTimeline({ events, isLoading }: ImeiHistoryTimelineProps) {
  const getEventIcon = (eventType: EventType) => {
    switch (eventType) {
      case EventTypeEnum.registered:
        return <Package className="h-5 w-5 text-blue-600" />;
      case EventTypeEnum.lostReported:
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case EventTypeEnum.stolenReported:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case EventTypeEnum.foundReported:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case EventTypeEnum.ownershipTransferred:
        return <UserCheck className="h-5 w-5 text-purple-600" />;
      case EventTypeEnum.ownershipReleaseRequested:
        return <FileText className="h-5 w-5 text-yellow-600" />;
      case EventTypeEnum.ownershipRevoked:
        return <Trash2 className="h-5 w-5 text-gray-600" />;
      case EventTypeEnum.reRegistered:
        return <RefreshCw className="h-5 w-5 text-indigo-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEventLabel = (eventType: EventType) => {
    switch (eventType) {
      case EventTypeEnum.registered:
        return 'Phone Registered';
      case EventTypeEnum.lostReported:
        return 'Reported Lost';
      case EventTypeEnum.stolenReported:
        return 'Reported Stolen';
      case EventTypeEnum.foundReported:
        return 'Reported Found';
      case EventTypeEnum.ownershipTransferred:
        return 'Ownership Transferred';
      case EventTypeEnum.ownershipReleaseRequested:
        return 'Release Requested';
      case EventTypeEnum.ownershipRevoked:
        return 'Ownership Revoked';
      case EventTypeEnum.reRegistered:
        return 'Re-registered';
      default:
        return 'Event';
    }
  };

  const getEventBadgeVariant = (eventType: EventType): "default" | "secondary" | "destructive" | "outline" => {
    switch (eventType) {
      case EventTypeEnum.registered:
      case EventTypeEnum.foundReported:
      case EventTypeEnum.reRegistered:
        return 'default';
      case EventTypeEnum.lostReported:
      case EventTypeEnum.ownershipReleaseRequested:
        return 'secondary';
      case EventTypeEnum.stolenReported:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp / BigInt(1000000)));
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate hand-off count (ownership transfers and re-registrations)
  const handOffCount = events.filter(
    (event) =>
      event.eventType === EventTypeEnum.ownershipTransferred ||
      event.eventType === EventTypeEnum.reRegistered
  ).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            IMEI History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-muted"></div>
                  <div className="h-3 w-2/3 rounded bg-muted"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            IMEI History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            No history available for this IMEI
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => {
    return Number(b.timestamp - a.timestamp);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            IMEI History
          </CardTitle>
          {handOffCount > 0 && (
            <Badge variant="outline" className="text-sm">
              {handOffCount} {handOffCount === 1 ? 'Hand-off' : 'Hand-offs'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getEventIcon(event.eventType)}
                </div>
                {index < sortedEvents.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border mt-2"></div>
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{getEventLabel(event.eventType)}</p>
                      <Badge variant={getEventBadgeVariant(event.eventType)} className="text-xs">
                        {getEventLabel(event.eventType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.details}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
