import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AdminRecoveryScreen() {
  const { clear, identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);

  const principalId = identity?.getPrincipal().toString() || "";

  const handleClaimAdmin = async () => {
    if (!actor) {
      toast.error("Backend not available");
      return;
    }

    setIsClaiming(true);
    try {
      const { UserRole } = await import("../backend");
      await actor.assignCallerUserRole(
        identity!.getPrincipal(),
        UserRole.admin,
      );

      // Invalidate all access-related queries to trigger UI update
      await queryClient.invalidateQueries({ queryKey: ["hasUserAccess"] });
      await queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      await queryClient.invalidateQueries({ queryKey: ["accessState"] });

      toast.success(
        "Admin access claimed successfully! You now have full system access.",
      );
    } catch (error: any) {
      console.error("Failed to claim admin:", error);
      const message = error.message || "Unknown error";
      if (message.toLowerCase().includes("admin already exists")) {
        toast.error(
          "An admin already exists. Please contact them for activation.",
        );
      } else {
        toast.error(`Failed to claim admin access: ${message}`);
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-lg shadow-xl border-amber-200 dark:border-amber-900">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <ShieldCheck className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            System Recovery Mode
          </CardTitle>
          <CardDescription className="text-base text-amber-700 dark:text-amber-300">
            No administrator exists in the system
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="ml-2 text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> The system has no active
              administrator. You can claim admin access to initialize the system
              and activate other users.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-950 p-4">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              What happens when you claim admin?
            </h3>
            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>You will become the system administrator</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>You can activate other users to access the system</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>You will have full access to all system features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-500">•</span>
                <span>This action cannot be undone without system reset</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Your Principal ID:
            </p>
            <code className="block break-all rounded bg-white dark:bg-gray-950 px-3 py-2 text-xs text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800">
              {principalId}
            </code>
          </div>

          <div className="flex flex-col gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600"
                  size="lg"
                  disabled={isClaiming}
                >
                  {isClaiming
                    ? "Claiming Admin Access..."
                    : "Claim Admin Access"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-amber-200 dark:border-amber-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-amber-900 dark:text-amber-100">
                    Confirm Admin Claim
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-amber-700 dark:text-amber-300">
                    Are you sure you want to claim administrator access? This
                    will make you the system administrator with full control
                    over user activation and system features.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-amber-300 dark:border-amber-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClaimAdmin}
                    className="bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600"
                  >
                    Yes, Claim Admin
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/30"
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
