import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Copy, LogOut, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivationPendingScreen() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principalId = identity?.getPrincipal().toString() || '';

  const handleCopyPrincipal = async () => {
    try {
      await navigator.clipboard.writeText(principalId);
      toast.success('Principal ID copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy Principal ID');
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Account Activation Required</CardTitle>
          <CardDescription className="text-base">
            Your account needs to be activated by an administrator before you can register phones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-2">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Copy your Principal ID below</li>
                <li>Contact the administrator via email</li>
                <li>Send your Principal ID to request activation</li>
                <li>Wait for admin to activate your account</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Your Principal ID:</p>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg bg-muted p-3 font-mono text-xs break-all">
                  {principalId}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPrincipal}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">Contact Administrator:</p>
              <p className="text-muted-foreground">
                Email:{' '}
                <a 
                  href="mailto:pasardigital1@gmail.com" 
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  pasardigital1@gmail.com
                </a>
              </p>
              <p className="text-muted-foreground mt-2">
                Include your Principal ID in the email to request account activation.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
