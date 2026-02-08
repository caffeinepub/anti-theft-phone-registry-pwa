import { useState } from 'react';
import { useReportFound } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Loader2, Smartphone } from 'lucide-react';

export default function ReportFoundPage() {
  const reportFound = useReportFound();

  const [imei, setImei] = useState('');
  const [finderInfo, setFinderInfo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imei) {
      reportFound.mutate(
        {
          imei,
          finderInfo: finderInfo.trim() || null,
        },
        {
          onSuccess: () => {
            setImei('');
            setFinderInfo('');
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Lapor Ponsel Ditemukan</h1>
              <p className="mt-1 text-sm text-green-100">Bantu pemilik menemukan ponsel mereka</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Laporkan Ponsel yang Ditemukan</CardTitle>
            <p className="text-sm text-muted-foreground">
              Jika Anda menemukan ponsel yang hilang, laporkan di sini untuk membantu pemiliknya
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="imei">IMEI Ponsel *</Label>
                <div className="relative mt-1">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="imei"
                    type="text"
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="Masukkan nomor IMEI (15 digit)"
                    required
                    minLength={15}
                    maxLength={15}
                    pattern="[0-9]{15}"
                    className="pl-9"
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  IMEI dapat ditemukan di pengaturan ponsel atau di belakang baterai
                </p>
              </div>

              <div>
                <Label htmlFor="finderInfo">Informasi Kontak Penemuan (Opsional)</Label>
                <Textarea
                  id="finderInfo"
                  value={finderInfo}
                  onChange={(e) => setFinderInfo(e.target.value)}
                  placeholder="Contoh: Nama, nomor telepon, atau lokasi tempat ponsel ditemukan..."
                  rows={4}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Informasi ini akan dikirim ke pemilik ponsel untuk memudahkan koordinasi
                </p>
              </div>

              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-medium">Apa yang terjadi setelah laporan?</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>Status ponsel akan diubah menjadi "Aktif"</li>
                      <li>Pemilik akan menerima notifikasi otomatis</li>
                      <li>Informasi kontak Anda akan dikirim ke pemilik</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={reportFound.isPending || !imei || imei.length !== 15}
              >
                {reportFound.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim Laporan...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Kirim Laporan Penemuan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="mb-3 font-semibold">Cara Menemukan IMEI:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-medium text-foreground">1.</span>
                <span>Ketik *#06# di aplikasi telepon</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">2.</span>
                <span>Cek di Pengaturan → Tentang Ponsel → IMEI</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground">3.</span>
                <span>Lihat di belakang baterai atau di kotak ponsel</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
