import { useState } from 'react';
import { useGetUserPhones, useAddPhone, useReleasePhone, useHasPin, useHasUserAccess } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Plus, Loader2, Trash2, AlertTriangle, Lock, KeyRound, XCircle } from 'lucide-react';
import { PhoneStatus } from '../backend';
import { useNavigate } from '@tanstack/react-router';
import PinSettingsDialog from '../components/PinSettingsDialog';

export default function MyPhonesPage() {
  const { data: phones = [], isLoading } = useGetUserPhones();
  const { data: hasPin, isLoading: checkingPin } = useHasPin();
  const { data: isActivated, isLoading: checkingActivation } = useHasUserAccess();
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
  const [releaseReason, setReleaseReason] = useState<string>('');
  const [otherReasonText, setOtherReasonText] = useState('');

  const handleOpenAddDialog = () => {
    // Check if user is activated before allowing phone registration
    if (!isActivated) {
      return;
    }
    
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
    setReleaseReason('');
    setOtherReasonText('');
    setIsReleaseDialogOpen(true);
  };

  const handleRelease = () => {
    if (!selectedPhone || !pin || !confirmationInput || !releaseReason) {
      return;
    }

    // Verify confirmation input matches last 4 digits of IMEI
    const last4Digits = selectedPhone.imei.slice(-4);
    if (confirmationInput !== last4Digits) {
      return;
    }

    // If reason is "other", require otherReasonText
    if (releaseReason === 'other' && !otherReasonText.trim()) {
      return;
    }

    // Build the reason object based on backend type
    let reasonObject;
    switch (releaseReason) {
      case 'sold':
        reasonObject = { __kind__: 'sold' as const, sold: null };
        break;
      case 'given':
        reasonObject = { __kind__: 'givenToSomeone' as const, givenToSomeone: null };
        break;
      case 'replaced':
        reasonObject = { __kind__: 'replacedWithNewPhone' as const, replacedWithNewPhone: null };
        break;
      case 'other':
        reasonObject = { __kind__: 'other' as const, other: otherReasonText.trim() };
        break;
      default:
        return;
    }

    releasePhone.mutate(
      { 
        imei: selectedPhone.imei, 
        pin: pin,
        reason: reasonObject
      },
      {
        onSuccess: () => {
          // Close dialog and reset state on success
          setIsReleaseDialogOpen(false);
          setSelectedPhone(null);
          setPin('');
          setConfirmationInput('');
          setReleaseReason('');
          setOtherReasonText('');
        },
        // Note: onError is handled by the mutation hook with toast
        // Dialog stays open on error so user can correct and retry
      }
    );
  };

  const isReleaseFormValid = () => {
    if (!selectedPhone || !pin || pin.length !== 4 || !confirmationInput || !releaseReason) {
      return false;
    }
    const last4Digits = selectedPhone.imei.slice(-4);
    if (confirmationInput !== last4Digits) {
      return false;
    }
    // If reason is "other", require otherReasonText
    if (releaseReason === 'other' && !otherReasonText.trim()) {
      return false;
    }
    return true;
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
        {/* Activation Warning */}
        {!checkingActivation && !isActivated && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <XCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-900 dark:text-yellow-100">
              <p className="font-semibold">Account Not Activated</p>
              <p className="mt-1 text-sm">
                Your account needs to be activated by an administrator before you can register phones. 
                Please contact the admin at{' '}
                <a 
                  href="mailto:pasardigital1@gmail.com" 
                  className="underline hover:text-yellow-700 dark:hover:text-yellow-300"
                >
                  pasardigital1@gmail.com
                </a>
                {' '}with your Principal ID to request activation.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Add Phone Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="mb-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:from-blue-700 hover:to-indigo-700"
              onClick={handleOpenAddDialog}
              disabled={!isActivated || checkingActivation}
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
                  placeholder="e.g., Samsung, Apple, Xiaomi"
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
                <Label htmlFor="registrationPin">Security PIN (4 digits)</Label>
                <Input
                  id="registrationPin"
                  type="password"
                  inputMode="numeric"
                  value={registrationPin}
                  onChange={(e) => setRegistrationPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  required
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {!hasPin 
                    ? 'This will be your security PIN for all phone operations'
                    : 'Enter your existing security PIN'}
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={addPhone.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
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
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Phones List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : phones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Smartphone className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">No phones registered yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {isActivated 
                  ? 'Click the button above to register your first phone'
                  : 'Activate your account to start registering phones'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {phones.map((phone) => (
              <Card key={phone.imei} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <CardTitle className="text-lg">
                          {phone.brand} {phone.model}
                        </CardTitle>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          IMEI: {phone.imei}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(phone.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate({ to: '/check', search: { imei: phone.imei } })}
                      className="flex-1"
                    >
                      View History
                    </Button>
                    {phone.status === PhoneStatus.active && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate({ to: '/report-lost', search: { imei: phone.imei } })}
                          className="flex-1"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Report Lost/Stolen
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openReleaseDialog(phone)}
                          disabled={!hasPin}
                          className="flex-1"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Release Ownership
                        </Button>
                      </>
                    )}
                  </div>
                  {!hasPin && phone.status === PhoneStatus.active && (
                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                      Set a PIN in your profile to release ownership
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Release Ownership Dialog */}
      <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Release Phone Ownership
            </DialogTitle>
            <DialogDescription>
              This action will permanently remove this phone from your account. The phone can be registered by a new owner.
            </DialogDescription>
          </DialogHeader>

          {selectedPhone && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Phone Details:</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedPhone.brand} {selectedPhone.model}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  IMEI: {selectedPhone.imei}
                </p>
              </div>

              <div>
                <Label htmlFor="releaseReason">Reason for Release</Label>
                <Select value={releaseReason} onValueChange={setReleaseReason}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="given">Given to someone</SelectItem>
                    <SelectItem value="replaced">Replaced with new phone</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {releaseReason === 'other' && (
                <div>
                  <Label htmlFor="otherReason">Please specify</Label>
                  <Input
                    id="otherReason"
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    placeholder="Enter reason"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="releasePin">Security PIN</Label>
                <Input
                  id="releasePin"
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your 4-digit PIN"
                  maxLength={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmation">
                  Type last 4 digits of IMEI to confirm ({selectedPhone.imei.slice(-4)})
                </Label>
                <Input
                  id="confirmation"
                  type="text"
                  inputMode="numeric"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter last 4 digits"
                  maxLength={4}
                  className="mt-1"
                />
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Warning:</strong> This action cannot be undone. The phone will be removed from your account immediately.
                </AlertDescription>
              </Alert>
            </div>
          )}

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
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Release Ownership
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN Setup Dialog */}
      <PinSettingsDialog 
        open={isPinSetupDialogOpen} 
        onOpenChange={setIsPinSetupDialogOpen}
        onPinSetSuccess={handlePinSetupSuccess}
      />
    </div>
  );
}
