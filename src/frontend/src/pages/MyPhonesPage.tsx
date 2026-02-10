import { useState } from 'react';
import { useGetUserPhones, useAddPhone, useReleasePhone, useHasPin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Smartphone, Plus, Loader2, Trash2, AlertTriangle, Lock, KeyRound } from 'lucide-react';
import { PhoneStatus } from '../backend';
import { useNavigate } from '@tanstack/react-router';
import PinSettingsDialog from '../components/PinSettingsDialog';

export default function MyPhonesPage() {
  const { data: phones = [], isLoading } = useGetUserPhones();
  const { data: hasPin, isLoading: checkingPin } = useHasPin();
  const addPhone = useAddPhone();
  const releasePhone = useReleasePhone();
  const navigate = useNavigate();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [imei, setImei] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [registrationPin, setRegistrationPin] = useState('');

  // PIN setup dialog for new users during registration
  const [isPinSetupDialogOpen, setIsPinSetupDialogOpen] = useState(false);

  // Release dialog state
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<{ imei: string; brand: string; model: string } | null>(null);
  const [pin, setPin] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');

  const handleOpenAddDialog = () => {
    setImei('');
    setBrand('');
    setModel('');
    setRegistrationPin('');
    setIsAddDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user doesn't have a PIN, open PIN setup dialog first
    if (!hasPin) {
      setIsPinSetupDialogOpen(true);
      return;
    }

    // If user has PIN, proceed with registration
    if (imei && brand && model && registrationPin) {
      addPhone.mutate(
        { imei, brand, model, pin: registrationPin },
        {
          onSuccess: () => {
            setImei('');
            setBrand('');
            setModel('');
            setRegistrationPin('');
            setIsAddDialogOpen(false);
          },
        }
      );
    }
  };

  const handlePinSetupSuccess = () => {
    // After PIN is set, close PIN dialog and proceed with registration
    setIsPinSetupDialogOpen(false);
    
    // Now submit the phone registration with the PIN that was just set
    if (imei && brand && model && registrationPin) {
      addPhone.mutate(
        { imei, brand, model, pin: registrationPin },
        {
          onSuccess: () => {
            setImei('');
            setBrand('');
            setModel('');
            setRegistrationPin('');
            setIsAddDialogOpen(false);
          },
        }
      );
    }
  };

  const openReleaseDialog = (phone: { imei: string; brand: string; model: string }) => {
    // Check if user has set a PIN
    if (!hasPin) {
      return;
    }
    
    setSelectedPhone(phone);
    setPin('');
    setConfirmationInput('');
    setIsReleaseDialogOpen(true);
  };

  const handleRelease = () => {
    if (!selectedPhone || !pin || !confirmationInput) {
      return;
    }

    // Verify confirmation input matches last 4 digits of IMEI
    const last4Digits = selectedPhone.imei.slice(-4);
    if (confirmationInput !== last4Digits) {
      return;
    }

    releasePhone.mutate(
      { 
        imei: selectedPhone.imei, 
        pin: pin
      },
      {
        onSuccess: () => {
          // Close dialog and reset state on success
          setIsReleaseDialogOpen(false);
          setSelectedPhone(null);
          setPin('');
          setConfirmationInput('');
        },
        // Note: onError is handled by the mutation hook with toast
        // Dialog stays open on error so user can correct and retry
      }
    );
  };

  const isReleaseFormValid = () => {
    if (!selectedPhone || !pin || pin.length !== 4 || !confirmationInput) {
      return false;
    }
    const last4Digits = selectedPhone.imei.slice(-4);
    return confirmationInput === last4Digits;
  };

  const isRegistrationFormValid = imei.length >= 15 && brand && model && registrationPin.length === 4;

  const getStatusBadge = (status: PhoneStatus) => {
    switch (status) {
      case PhoneStatus.active:
        return <Badge className="bg-green-500">Active</Badge>;
      case PhoneStatus.lost:
        return <Badge variant="destructive">Lost</Badge>;
      case PhoneStatus.stolen:
        return <Badge variant="destructive">Stolen</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">My Phones</h1>
          <p className="mt-1 text-sm text-blue-100">Manage your registered phones</p>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Add Phone Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="mb-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:from-blue-700 hover:to-indigo-700"
              onClick={handleOpenAddDialog}
            >
              <Plus className="mr-2 h-5 w-5" />
              Register New Phone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Phone</DialogTitle>
              <DialogDescription>
                {!hasPin 
                  ? 'You will be asked to set a 4-digit security PIN during registration to protect your phone ownership.'
                  : 'Enter your phone details and your security PIN to register.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="imei">IMEI Number</Label>
                <Input
                  id="imei"
                  value={imei}
                  onChange={(e) => setImei(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 15-digit IMEI"
                  maxLength={15}
                  required
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Dial *#06# to view your phone's IMEI
                </p>
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g., Samsung, iPhone, Xiaomi"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., Galaxy S21, iPhone 13"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="registrationPin" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security PIN (Required)
                </Label>
                <Input
                  id="registrationPin"
                  type="password"
                  inputMode="numeric"
                  placeholder={hasPin ? "Enter your 4-digit PIN" : "Create a 4-digit PIN"}
                  value={registrationPin}
                  onChange={(e) => setRegistrationPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  required
                  className="mt-1 font-mono text-center text-lg tracking-widest"
                  autoComplete="off"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {hasPin 
                    ? 'Enter your existing 4-digit PIN'
                    : 'Create a 4-digit PIN to secure your phone ownership'}
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!isRegistrationFormValid || addPhone.isPending}
              >
                {addPhone.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Phone'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* PIN Setup Dialog for new users */}
        <PinSettingsDialog 
          open={isPinSetupDialogOpen} 
          onOpenChange={setIsPinSetupDialogOpen}
          onPinSetSuccess={handlePinSetupSuccess}
        />

        {/* Release Ownership Dialog */}
        <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Release Phone Ownership</DialogTitle>
              <DialogDescription>
                This action will immediately remove this phone from your account. Enter your PIN and confirm to proceed.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-semibold">Warning: Immediate Release</p>
                    <p className="mt-1">
                      Once you confirm, this phone will be immediately removed from your account. This action cannot be undone. Anyone can register this IMEI after release.
                    </p>
                  </div>
                </div>
              </div>

              {selectedPhone && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Phone Details:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPhone.brand} {selectedPhone.model}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">IMEI: {selectedPhone.imei}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmationInput" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Confirmation (Required)
                </Label>
                <Input
                  id="confirmationInput"
                  type="text"
                  inputMode="numeric"
                  placeholder={selectedPhone ? `Type last 4 digits: ${selectedPhone.imei.slice(-4)}` : 'Type last 4 digits of IMEI'}
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="font-mono text-center text-lg tracking-widest"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Type the last 4 digits of the IMEI to confirm
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security PIN (Required)
                </Label>
                <Input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter your 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="font-mono text-center text-lg tracking-widest"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 4-digit PIN you set in your Profile settings
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsReleaseDialogOpen(false)}
                disabled={releasePhone.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRelease}
                disabled={!isReleaseFormValid() || releasePhone.isPending}
              >
                {releasePhone.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Releasing...
                  </>
                ) : (
                  'Release Ownership'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PIN Not Set Warning for legacy users */}
        {!checkingPin && !hasPin && phones.length > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <KeyRound className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Security PIN Required
                  </p>
                  <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                    You have registered phones but haven't set a security PIN yet. You must set a 4-digit security PIN before you can release ownership of any phone. This adds an extra layer of protection against unauthorized releases.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-yellow-600 text-yellow-900 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-100 dark:hover:bg-yellow-900"
                    onClick={() => navigate({ to: '/profile' })}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Set PIN in Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phones List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : phones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Smartphone className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No phones registered yet
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Click the button above to register your phone
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {phones.map((phone) => (
              <Card key={phone.imei} className="shadow-md transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {phone.brand} {phone.model}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">IMEI: {phone.imei}</p>
                    </div>
                    {getStatusBadge(phone.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => openReleaseDialog(phone)}
                    disabled={!hasPin || checkingPin}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Release Ownership
                  </Button>
                  {!hasPin && !checkingPin && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Set a PIN in Profile to enable this action
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
