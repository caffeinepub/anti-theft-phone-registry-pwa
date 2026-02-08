import { useState } from 'react';
import { useCheckImei, useGetIMEIHistory } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { PhoneStatus } from '../backend';
import ImeiHistoryTimeline from '../components/ImeiHistoryTimeline';

export default function CheckImeiPage() {
  const [imeiInput, setImeiInput] = useState('');
  const [searchImei, setSearchImei] = useState('');

  const { data: status, isLoading: statusLoading, isFetched: statusFetched } = useCheckImei(searchImei);
  const { data: history = [], isLoading: historyLoading } = useGetIMEIHistory(searchImei);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (imeiInput.length >= 15) {
      setSearchImei(imeiInput);
    }
  };

  const renderResult = () => {
    if (!statusFetched || !searchImei) return null;

    if (status === null) {
      return (
        <Card className="border-2 border-blue-500 shadow-lg">
          <CardContent className="flex flex-col items-center py-12">
            <Shield className="mb-4 h-16 w-16 text-blue-600" />
            <h3 className="mb-2 text-xl font-bold text-foreground">Ponsel Aman</h3>
            <p className="text-center text-muted-foreground">
              IMEI ini tidak terdaftar dalam sistem kami
            </p>
            <Badge className="mt-4 bg-blue-500">Tidak Ada Laporan</Badge>
          </CardContent>
        </Card>
      );
    }

    if (status === PhoneStatus.active) {
      return (
        <Card className="border-2 border-green-500 shadow-lg">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
            <h3 className="mb-2 text-xl font-bold text-foreground">Ponsel Terdaftar</h3>
            <p className="text-center text-muted-foreground">
              Ponsel ini terdaftar dan dalam status aktif
            </p>
            <Badge className="mt-4 bg-green-500">Status Aktif</Badge>
          </CardContent>
        </Card>
      );
    }

    if (status === PhoneStatus.lost || status === PhoneStatus.stolen) {
      return (
        <Card className="border-2 border-red-500 shadow-lg">
          <CardContent className="flex flex-col items-center py-12">
            <AlertTriangle className="mb-4 h-16 w-16 text-red-600" />
            <h3 className="mb-2 text-xl font-bold text-foreground">⚠️ PERINGATAN!</h3>
            <p className="text-center text-muted-foreground">
              Ponsel ini telah dilaporkan {status === PhoneStatus.stolen ? 'dicuri' : 'hilang'}
            </p>
            <Badge variant="destructive" className="mt-4">
              {status === PhoneStatus.stolen ? 'Dilaporkan Dicuri' : 'Dilaporkan Hilang'}
            </Badge>
            <div className="mt-6 rounded-lg bg-red-50 p-4 dark:bg-red-950">
              <p className="text-center text-sm text-red-800 dark:text-red-200">
                <strong>Jangan membeli ponsel ini!</strong> Hubungi pihak berwenang jika Anda menemukan ponsel ini dijual.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-teal-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <Search className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Cek Status IMEI</h1>
              <p className="mt-1 text-sm text-green-100">Periksa status ponsel sebelum membeli</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Search Form */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Masukkan Nomor IMEI</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <Label htmlFor="imei">Nomor IMEI (15 digit)</Label>
                <Input
                  id="imei"
                  value={imeiInput}
                  onChange={(e) => setImeiInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Masukkan 15 digit IMEI"
                  maxLength={15}
                  required
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Ketik *#06# di ponsel untuk melihat nomor IMEI
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                disabled={statusLoading || imeiInput.length < 15}
              >
                <Search className="mr-2 h-4 w-4" />
                Cek Status IMEI
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Mengapa Cek IMEI Penting?
                </h3>
                <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
                  Sebelum membeli ponsel bekas, pastikan ponsel tersebut tidak dalam status hilang atau dicuri. 
                  Cek IMEI membantu Anda menghindari pembelian barang curian.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Result */}
        {statusLoading ? (
          <Card className="animate-pulse mb-6">
            <CardContent className="py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted"></div>
              <div className="mx-auto mt-4 h-4 w-48 rounded bg-muted"></div>
            </CardContent>
          </Card>
        ) : (
          <>
            {renderResult()}
            
            {/* IMEI History Timeline */}
            {searchImei && statusFetched && (
              <div className="mt-6">
                <ImeiHistoryTimeline events={history} isLoading={historyLoading} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
