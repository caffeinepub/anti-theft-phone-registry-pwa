import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Plus, Loader2, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useGenerateInviteCode, useGetInviteCodesWithStatus } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function AdminInviteManagementPage() {
  const { data: invites = [], isLoading, refetch, isFetching } = useGetInviteCodesWithStatus();
  const generateInvite = useGenerateInviteCode();

  const handleCreateInvite = async () => {
    try {
      const code = await generateInvite.mutateAsync();
      
      // Copy invite link to clipboard with correct parameter name
      const inviteLink = `${window.location.origin}?code=${code}`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite created and link copied to clipboard!');
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleCopyLink = async (code: string) => {
    const inviteLink = `${window.location.origin}?code=${code}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Invite list refreshed');
    } catch (error) {
      toast.error('Failed to refresh invite list');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp / BigInt(1000000)));
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (invite: typeof invites[0]) => {
    if (invite.deactivated) {
      return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Deactivated</Badge>;
    }
    if (invite.used) {
      return <Badge variant="secondary"><CheckCircle className="mr-1 h-3 w-3" />Used</Badge>;
    }
    return <Badge variant="default" className="bg-green-500"><Clock className="mr-1 h-3 w-3" />Unused</Badge>;
  };

  const unusedInvites = invites.filter(inv => !inv.used && !inv.deactivated);
  const usedInvites = invites.filter(inv => inv.used);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invite Management</h1>
          <p className="text-muted-foreground">Create and manage invite codes for new users</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="lg" 
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button onClick={handleCreateInvite} size="lg" disabled={generateInvite.isPending}>
            {generateInvite.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create & Copy Link
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{invites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{unusedInvites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{usedInvites.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invites</CardTitle>
          <CardDescription>View and manage all invite codes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : invites.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No invites created yet. Click "Create & Copy Link" to generate your first invite.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used At</TableHead>
                    <TableHead>Used By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.code}>
                      <TableCell className="font-mono text-sm">{invite.code}</TableCell>
                      <TableCell className="text-sm">{formatDate(invite.created)}</TableCell>
                      <TableCell>{getStatusBadge(invite)}</TableCell>
                      <TableCell className="text-sm">
                        {invite.usedAt ? formatDate(invite.usedAt) : '-'}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {invite.usedBy ? invite.usedBy.toString().slice(0, 10) + '...' : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(invite.code)}
                          disabled={invite.used || invite.deactivated}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
