import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useHasPin, useHasUserAccess } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, MapPin, LogOut, Shield, Lock, KeyRound, CheckCircle, XCircle } from 'lucide-react';
import PinSettingsDialog from '../components/PinSettingsDialog';

export default function ProfilePage() {
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: hasPin, isLoading: checkingPin } = useHasPin();
  const { data: isActivated, isLoading: checkingActivation } = useHasUserAccess();
  const queryClient = useQueryClient();
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Profil Saya</h1>
              <p className="mt-1 text-sm text-purple-100">Informasi akun Anda</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Account Status Card */}
        <Card className={`mb-6 ${isActivated ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950' : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isActivated ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                )}
                <div>
                  <p className={`font-semibold ${isActivated ? 'text-green-900 dark:text-green-100' : 'text-yellow-900 dark:text-yellow-100'}`}>
                    {checkingActivation ? 'Checking status...' : isActivated ? 'Account Activated' : 'Account Not Activated'}
                  </p>
                  <p className={`text-sm ${isActivated ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                    {isActivated 
                      ? 'You can register phones and use all features' 
                      : 'Contact admin to activate your account'}
                  </p>
                </div>
              </div>
              <Badge className={isActivated ? 'bg-green-600' : 'bg-yellow-600'}>
                {isActivated ? 'Activated' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">{userProfile?.email.split('@')[0] || 'Pengguna'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userProfile?.email || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Kota</p>
                <p className="font-medium">{userProfile?.city || '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Principal ID</p>
                <p className="break-all font-mono text-xs">
                  {identity?.getPrincipal().toString() || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Ownership Release PIN</p>
                  <p className="text-sm text-muted-foreground">
                    {checkingPin ? 'Checking...' : hasPin ? 'PIN is set' : 'No PIN set'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPinDialogOpen(true)}
                disabled={checkingPin}
              >
                {hasPin ? 'Change PIN' : 'Set PIN'}
              </Button>
            </div>

            {!hasPin && !checkingPin && (
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100">
                <p className="font-semibold">Action Required:</p>
                <p className="mt-1">
                  You must set a 4-digit PIN before you can release ownership of any phone. This adds an extra layer of security.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Pasar Digital Community</p>
          <p className="mt-1">
            Butuh bantuan? Email:{' '}
            <a 
              href="mailto:pasardigital1@gmail.com" 
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              pasardigital1@gmail.com
            </a>
          </p>
        </footer>
      </div>

      {/* PIN Settings Dialog */}
      <PinSettingsDialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen} />
    </div>
  );
}
