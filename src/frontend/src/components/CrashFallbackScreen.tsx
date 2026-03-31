import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function CrashFallbackScreen() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Please try reloading the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          If the problem persists, please contact support.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleReload} size="lg">
            Reload Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
