import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { useActivateUser } from '../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';

export default function AdminUserActivationPage() {
  const [principalInput, setPrincipalInput] = useState('');
  const [isValidPrincipal, setIsValidPrincipal] = useState(false);
  const activateUser = useActivateUser();

  const validatePrincipal = (input: string) => {
    try {
      Principal.fromText(input.trim());
      setIsValidPrincipal(true);
    } catch {
      setIsValidPrincipal(false);
    }
  };

  const handleInputChange = (value: string) => {
    setPrincipalInput(value);
    if (value.trim()) {
      validatePrincipal(value);
    } else {
      setIsValidPrincipal(false);
    }
  };

  const handleActivate = async () => {
    if (!isValidPrincipal || !principalInput.trim()) {
      return;
    }

    try {
      const principal = Principal.fromText(principalInput.trim());
      await activateUser.mutateAsync(principal);
      setPrincipalInput('');
      setIsValidPrincipal(false);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidPrincipal && !activateUser.isPending) {
      handleActivate();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold">User Activation</h1>
        <p className="text-muted-foreground">Activate user accounts to allow phone registration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Activate User Account
          </CardTitle>
          <CardDescription>
            Enter the user's Principal ID to grant them access to register phones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-900 dark:text-blue-100">
              <p className="font-semibold mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>User logs in with Internet Identity</li>
                <li>User contacts you with their Principal ID</li>
                <li>You enter their Principal ID here to activate their account</li>
                <li>User can now register phones in the application</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="principalId">User Principal ID</Label>
            <Input
              id="principalId"
              type="text"
              placeholder="Enter Principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-xxx)"
              value={principalInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={activateUser.isPending}
              className="font-mono text-sm"
            />
            {principalInput && !isValidPrincipal && (
              <p className="text-sm text-destructive">Invalid Principal ID format</p>
            )}
            {principalInput && isValidPrincipal && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Valid Principal ID
              </p>
            )}
          </div>

          <Button
            onClick={handleActivate}
            disabled={!isValidPrincipal || activateUser.isPending}
            className="w-full"
            size="lg"
          >
            {activateUser.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activating User...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </Button>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Users must log in with Internet Identity first before activation</li>
              <li>Activation is immediate and cannot be undone from this interface</li>
              <li>Activated users can register and manage phones</li>
              <li>Users will see their activation status in their profile</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
