import { useGetStatistics } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Smartphone, AlertTriangle, ShieldCheck, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatisticsPage() {
  const { data: statistics, isLoading, isError, error } = useGetStatistics();

  // Loading state with proper skeleton UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-6 text-white shadow-lg">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Laporan Statistik</h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-blue-100">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat data statistik...
                </p>
              </div>
              <img 
                src="/assets/generated/statistics-chart-icon-transparent.dim_64x64.png" 
                alt="Statistics Icon" 
                className="h-12 w-12"
              />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Summary Cards Skeleton */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Chart Skeletons */}
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-6 text-white shadow-lg">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Laporan Statistik</h1>
                <p className="mt-1 text-sm text-blue-100">Terjadi kesalahan saat memuat data</p>
              </div>
              <img 
                src="/assets/generated/statistics-chart-icon-transparent.dim_64x64.png" 
                alt="Statistics Icon" 
                className="h-12 w-12"
              />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Data Statistik</AlertTitle>
            <AlertDescription>
              Terjadi kesalahan saat mengambil data statistik. Silakan coba lagi nanti.
              {error && <div className="mt-2 text-sm">{String(error)}</div>}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Safe data extraction with explicit fallbacks
  const totalPhones = statistics?.totalPhones ? Number(statistics.totalPhones) : 0;
  const activePhones = statistics?.activePhones !== undefined ? Number(statistics.activePhones) : 0;
  const lostPhones = statistics?.lostPhones ? Number(statistics.lostPhones) : 0;
  const stolenPhones = statistics?.stolenPhones ? Number(statistics.stolenPhones) : 0;
  const totalReports = statistics?.theftReportStats?.total ? Number(statistics.theftReportStats.total) : 0;

  // Prepare status data for pie chart - only include categories with values > 0 or show all if total > 0
  const statusData = [
    { name: 'Aktif', value: activePhones, color: 'hsl(142, 76%, 36%)' }, // Green
    { name: 'Hilang', value: lostPhones, color: 'hsl(38, 92%, 50%)' }, // Orange
    { name: 'Dicuri', value: stolenPhones, color: 'hsl(0, 84%, 60%)' }, // Red
  ].filter(item => item.value > 0); // Only show non-zero values in chart

  // Check if there's any data to display
  const hasPhoneData = totalPhones > 0;
  const hasReportData = totalReports > 0;

  // Prepare monthly data with safe defaults
  const monthNames = ['12 bln lalu', '11 bln lalu', '10 bln lalu', '9 bln lalu', '8 bln lalu', '7 bln lalu', '6 bln lalu', '5 bln lalu', '4 bln lalu', '3 bln lalu', '2 bln lalu', 'Bulan lalu'];
  const monthlyData = statistics?.theftReportStats?.monthly 
    ? statistics.theftReportStats.monthly.map((count, index) => ({
        month: monthNames[index] || `Bulan ${index + 1}`,
        laporan: Number(count),
      })).reverse()
    : monthNames.map((month) => ({ month, laporan: 0 })).reverse();

  const chartConfig = {
    laporan: {
      label: 'Laporan',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Laporan Statistik</h1>
              <p className="mt-1 text-sm text-blue-100">Data dan analisis sistem</p>
            </div>
            <img 
              src="/assets/generated/statistics-chart-icon-transparent.dim_64x64.png" 
              alt="Statistics Icon" 
              className="h-12 w-12"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6 pb-24">
        {/* Empty state message */}
        {!hasPhoneData && !hasReportData && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Belum Ada Data</AlertTitle>
            <AlertDescription>
              Belum ada ponsel yang terdaftar atau laporan yang dibuat dalam sistem. 
              Data statistik akan muncul setelah ada aktivitas pengguna.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards - All 4 categories clearly displayed */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Total Phones */}
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                  <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Ponsel</p>
                  <p className="text-2xl font-bold text-foreground">{totalPhones}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Phones - Highlighted */}
          <Card className="shadow-md border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                  <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ponsel Aktif</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activePhones}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lost Phones */}
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ponsel Hilang</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{lostPhones}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stolen Phones */}
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ponsel Dicuri</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stolenPhones}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution Pie Chart */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribusi Status Ponsel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasPhoneData && statusData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[0].name}
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].value}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-center">
                <div className="text-muted-foreground">
                  <Smartphone className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm">Belum ada data ponsel untuk ditampilkan</p>
                  <p className="mt-1 text-xs">Grafik akan muncul setelah ada ponsel terdaftar</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Reports Line Chart */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Riwayat Laporan Kehilangan & Pencurian (12 Bulan Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="laporan" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-1))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            {!hasReportData && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada laporan kehilangan atau pencurian dalam 12 bulan terakhir
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Reports Summary */}
        <Card className="mt-6 shadow-md">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Laporan Kehilangan & Pencurian</p>
              <p className="mt-2 text-4xl font-bold text-foreground">
                {totalReports}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalReports > 0 ? 'Sejak sistem diluncurkan' : 'Belum ada laporan'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
