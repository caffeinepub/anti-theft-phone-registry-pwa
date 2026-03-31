import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Smartphone,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllTheftReports,
  useGetStatistics,
  useGetUserPhones,
} from "../hooks/useQueries";

export default function HomePage() {
  const { data: reports = [], isLoading: reportsLoading } =
    useGetAllTheftReports();
  const { data: statistics, isLoading: statsLoading } = useGetStatistics();
  const { identity } = useInternetIdentity();
  const { data: userPhones = [], isLoading: phonesLoading } =
    useGetUserPhones();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  };

  const totalPhones = statistics ? Number(statistics.totalPhones) : 0;
  const totalReports = reports.length;

  const hasPhones = userPhones.length > 0;

  type Task = { done: boolean; label: string; link: string | null };
  const tasks: Task[] = [
    { done: !!identity, label: "Login dengan Internet Identity", link: null },
    { done: true, label: "Akun sudah diaktifkan oleh admin", link: null },
    {
      done: hasPhones,
      label: hasPhones
        ? `${userPhones.length} ponsel sudah terdaftar`
        : "Daftarkan ponsel pertama Anda",
      link: hasPhones ? null : "/phones",
    },
  ];

  const pendingTasks = tasks.filter((t) => !t.done);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-8 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center gap-3">
            <img
              src="/assets/Logo Pasar Digital Community.png"
              alt="Pasar Digital Community Logo"
              className="h-12 w-12 rounded-full bg-white p-1"
            />
            <div>
              <h1 className="text-2xl font-bold">Anti-Pencurian Ponsel</h1>
              <p className="text-sm text-blue-100">
                Sistem Registrasi Terpercaya
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Total Laporan</span>
              </div>
              {reportsLoading ? (
                <div className="mt-1 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-lg">Memuat...</span>
                </div>
              ) : (
                <p className="mt-1 text-2xl font-bold">{totalReports}</p>
              )}
            </div>
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span className="text-sm">Total Ponsel Terlindungi</span>
              </div>
              {statsLoading ? (
                <div className="mt-1 flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-lg">Memuat...</span>
                </div>
              ) : (
                <p className="mt-1 text-2xl font-bold">{totalPhones}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Task Reminder */}
        {!phonesLoading && pendingTasks.length > 0 && (
          <Card className="mb-6 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5" />
                Langkah yang Perlu Diselesaikan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tasks.map((task, idx) => (
                <div key={task.label} className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                      task.done
                        ? "bg-green-100 text-green-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {task.done ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                  {task.link ? (
                    <Link
                      to={task.link}
                      className="flex flex-1 items-center justify-between text-sm font-medium text-amber-800 hover:underline dark:text-amber-200"
                    >
                      {task.label}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span
                      className={`text-sm ${
                        task.done
                          ? "text-muted-foreground line-through"
                          : "font-medium text-amber-800 dark:text-amber-200"
                      }`}
                    >
                      {task.label}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Laporan Terbaru
          </h2>
          <p className="text-sm text-muted-foreground">
            Daftar ponsel yang dilaporkan hilang atau dicuri
          </p>
        </div>

        {reportsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Belum ada laporan ponsel hilang atau dicuri
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <Card
                key={index}
                className="overflow-hidden border-l-4 border-l-red-500 shadow-md transition-shadow hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        IMEI: {report.imei}
                      </CardTitle>
                      <Badge variant="destructive" className="mt-2">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Dilaporkan Hilang/Dicuri
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {report.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatTimestamp(report.timestamp)}
                    </span>
                  </div>
                  {report.details && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm text-foreground">
                        {report.details}
                      </p>
                    </div>
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
