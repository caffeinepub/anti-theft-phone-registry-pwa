import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, AlertCircle } from 'lucide-react';
import { useSetOrChangePin, useHasPin } from '../hooks/useQueries';

interface PinSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPinSetSuccess?: () => void;
}

export default function PinSettingsDialog({ open, onOpenChange, onPinSetSuccess }: PinSettingsDialogProps) {
  const { data: hasPin, isLoading: checkingPin } = useHasPin();
  const setOrChangePin = useSetOrChangePin();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const isChangingPin = hasPin === true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate PIN format
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    // Validate PIN confirmation
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    // If changing PIN, current PIN is required
    if (isChangingPin && !currentPin) {
      setError('Current PIN is required');
      return;
    }

    setOrChangePin.mutate(
      {
        newPin,
        currentPin: isChangingPin ? currentPin : undefined,
        onSuccessCallback: onPinSetSuccess,
      },
      {
        onSuccess: () => {
          setCurrentPin('');
          setNewPin('');
          setConfirmPin('');
          setError('');
          onOpenChange(false);
        },
        onError: () => {
          // Error is handled by the mutation hook
        },
      }
    );
  };

  const handleCancel = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    onOpenChange(false);
  };

  const isFormValid = 
    newPin.length === 4 && 
    confirmPin.length === 4 && 
    newPin === confirmPin &&
    (!isChangingPin || currentPin.length === 4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {isChangingPin ? 'Change Security PIN' : 'Set Security PIN'}
          </DialogTitle>
          <DialogDescription>
            {isChangingPin 
              ? 'Enter your current PIN and choose a new 4-digit PIN to secure phone ownership releases.'
              : 'Set a 4-digit PIN to secure phone ownership releases. You will need this PIN to release ownership of any phone.'}
          </DialogDescription>
        </DialogHeader>

        {checkingPin ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isChangingPin && (
              <div className="space-y-2">
                <Label htmlFor="currentPin">Current PIN</Label>
                <Input
                  id="currentPin"
                  type="password"
                  inputMode="numeric"
                  placeholder="Enter current 4-digit PIN"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  className="font-mono text-center text-lg tracking-widest"
                  autoComplete="off"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPin">New PIN</Label>
              <Input
                id="newPin"
                type="password"
                inputMode="numeric"
                placeholder="Enter 4-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="font-mono text-center text-lg tracking-widest"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm New PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                inputMode="numeric"
                placeholder="Re-enter 4-digit PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="font-mono text-center text-lg tracking-widest"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-950 dark:text-blue-100">
              <p className="font-semibold">Security Notice:</p>
              <p className="mt-1">
                This PIN will be required whenever you want to release ownership of a phone. Keep it secure and memorable.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={setOrChangePin.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || setOrChangePin.isPending}
              >
                {setOrChangePin.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isChangingPin ? 'Change PIN' : 'Set PIN'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
