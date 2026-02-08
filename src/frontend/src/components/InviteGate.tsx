import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Gift, AlertCircle } from 'lucide-react';
import { getUrlParameter, clearSessionParameter } from '../utils/urlParams';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function InviteGate() {
  const [inviteCode, setInviteCode] = useState('');
  const [hasUrlCode, setHasUrlCode] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { actor } = useActor();
  const queryClient = useQueryClient();

  useEffect(() => {
    const urlCode = getUrlParameter('code');
    if (urlCode) {
      setInviteCode(urlCode);
      setHasUrlCode(true);
    }
  }, []);

  const handleRedeem = async () => {
    if (!inviteCode.trim() || !actor) {
      return;
    }

    setIsRedeeming(true);
    try {
      // Redeem the invite code using the correct backend method
      await actor.redeemInviteCode(inviteCode.trim());
      
      // Clear the invite code from session storage
      clearSessionParameter('inviteCode');
      
      // Invalidate access state and profile to trigger re-check
      queryClient.invalidateQueries({ queryKey: ['accessState'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      
      // Invalidate admin invite list queries so status updates immediately
      queryClient.invalidateQueries({ queryKey: ['inviteCodesWithStatus'] });
      queryClient.invalidateQueries({ queryKey: ['inviteCodes'] });
      
      toast.success('Invite code redeemed successfully! Welcome to Pasar Digital Community.');
    } catch (error: any) {
      const message = error.message.toLowerCase();
      if (message.includes('not found') || message.includes('invalid')) {
        toast.error('Invalid invite code. Please check and try again.');
      } else if (message.includes('already used') || message.includes('used')) {
        toast.error('This invite code has already been used.');
      } else if (message.includes('already have user access')) {
        toast.error('You already have access to the application.');
      } else if (message.includes('deactivated')) {
        toast.error('This invite code has been deactivated.');
      } else {
        toast.error('Failed to redeem invite: ' + error.message);
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inviteCode.trim() && !isRedeeming) {
      handleRedeem();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Gift className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Welcome to Pasar Digital Community</CardTitle>
          <CardDescription className="text-base">
            This application requires an invite code to access. Please enter your invite code below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasUrlCode && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We detected an invite code in your link. Click "Redeem Invite" to continue.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isRedeeming}
              className="font-mono"
            />
          </div>

          <Button
            onClick={handleRedeem}
            disabled={!inviteCode.trim() || isRedeeming}
            className="w-full"
            size="lg"
          >
            {isRedeeming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redeeming...
              </>
            ) : (
              'Redeem Invite'
            )}
          </Button>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-semibold">Don't have an invite code?</p>
            <p className="mt-1">
              Contact the administrator at{' '}
              <a href="mailto:pasardigital1@gmail.com" className="text-blue-600 hover:underline dark:text-blue-400">
                pasardigital1@gmail.com
              </a>{' '}
              to request access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
