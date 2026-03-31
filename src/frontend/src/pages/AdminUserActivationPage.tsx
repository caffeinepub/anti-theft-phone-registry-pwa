import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Principal } from "@icp-sdk/core/principal";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useState } from "react";
import type { ActivationTokenInfo, TokenStatus } from "../backend";
import {
  useGenerateActivationToken,
  useGetActivationTokenHistory,
} from "../hooks/useQueries";
import { useTranslation } from "../i18n/useTranslation";

export default function AdminUserActivationPage() {
  const { t } = useTranslation();
  const generateToken = useGenerateActivationToken();
  const {
    data: tokenHistory = [],
    isLoading,
    refetch,
  } = useGetActivationTokenHistory();

  const [principalInput, setPrincipalInput] = useState("");
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateToken = () => {
    try {
      // Validate Principal ID
      Principal.fromText(principalInput.trim());

      generateToken.mutate(principalInput.trim(), {
        onSuccess: (token) => {
          setGeneratedToken(token);
          setPrincipalInput("");
        },
      });
    } catch (error) {
      console.error("Invalid Principal ID:", error);
    }
  };

  const handleCopyToken = async () => {
    if (generatedToken) {
      try {
        await navigator.clipboard.writeText(generatedToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const getStatusBadge = (status: TokenStatus) => {
    switch (status) {
      case "unused":
        return (
          <Badge className="bg-blue-500">
            {t("admin.activation.status.unused")}
          </Badge>
        );
      case "used":
        return (
          <Badge className="bg-green-500">
            {t("admin.activation.status.used")}
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary">
            {t("admin.activation.status.expired")}
          </Badge>
        );
      case "revoked":
        return (
          <Badge variant="destructive">
            {t("admin.activation.status.revoked")}
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp / BigInt(1000000)));
    return date.toLocaleString();
  };

  const formatPrincipal = (principal: Principal) => {
    const str = principal.toString();
    if (str.length > 20) {
      return `${str.slice(0, 10)}...${str.slice(-8)}`;
    }
    return str;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">
                {t("admin.activation.title")}
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                {t("admin.activation.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Generate Token Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              {t("admin.activation.generateSection")}
            </CardTitle>
            <CardDescription>
              {t("admin.activation.sendInstructions")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">
                {t("admin.activation.principalLabel")}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="principal"
                  value={principalInput}
                  onChange={(e) => setPrincipalInput(e.target.value)}
                  placeholder={t("admin.activation.principalPlaceholder")}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleGenerateToken}
                  disabled={!principalInput.trim() || generateToken.isPending}
                  className="shrink-0"
                >
                  {generateToken.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("admin.activation.generating")}
                    </>
                  ) : (
                    t("admin.activation.generateButton")
                  )}
                </Button>
              </div>
            </div>

            {/* Generated Token Display */}
            {generatedToken && (
              <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                <KeyRound className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    {t("admin.activation.tokenGenerated")}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-green-100 dark:bg-green-900/30 px-3 py-2 text-sm font-mono text-green-900 dark:text-green-100">
                      {generatedToken}
                    </code>
                    <Button
                      onClick={handleCopyToken}
                      variant="outline"
                      size="icon"
                      className="shrink-0 border-green-300 dark:border-green-800"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Token History Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("admin.activation.historySection")}</CardTitle>
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {t("admin.activation.refreshButton")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tokenHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <KeyRound className="mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  {t("admin.activation.historyEmpty")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("admin.activation.historyColumns.token")}
                      </TableHead>
                      <TableHead>
                        {t("admin.activation.historyColumns.createdFor")}
                      </TableHead>
                      <TableHead>
                        {t("admin.activation.historyColumns.createdAt")}
                      </TableHead>
                      <TableHead>
                        {t("admin.activation.historyColumns.status")}
                      </TableHead>
                      <TableHead>
                        {t("admin.activation.historyColumns.usedAt")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokenHistory.map((tokenInfo: ActivationTokenInfo) => (
                      <TableRow key={tokenInfo.token}>
                        <TableCell className="font-mono text-xs">
                          {tokenInfo.token.slice(0, 8)}...
                          {tokenInfo.token.slice(-4)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatPrincipal(tokenInfo.createdFor)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(tokenInfo.createdAt)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(tokenInfo.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {tokenInfo.usedAt
                            ? formatDate(tokenInfo.usedAt)
                            : "-"}
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
    </div>
  );
}
