import { useState, useEffect } from 'react';
import { useGetUserPhones, useReportLostStolen } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { PhoneStatus } from '../backend';

export default function ReportLostPage() {
  const { data: phones = [], isLoading } = useGetUserPhones();
  const reportLostStolen = useReportLostStolen();

  const [selectedImei, setSelectedImei] = useState('');
  const [reportType, setReportType] = useState<'lost' | 'stolen'>('lost');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Filter only active phones
  const activePhones = phones.filter((phone) => phone.status === PhoneStatus.active);

  const getLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation('Lokasi tidak tersedia');
          setIsGettingLocation(false);
        }
      );
    } else {
      setLocation('Geolocation tidak didukung');
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImei && location && details) {
      reportLostStolen.mutate(
        {
          imei: selectedImei,
          location,
          details,
          isStolen: reportType === 'stolen',
        },
        {
          onSuccess: () => {
            setSelectedImei('');
            setDetails('');
            setReportType('lost');
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-6 text-white shadow-lg">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Laporkan Kehilangan</h1>
              <p className="mt-1 text-sm text-red-100">Laporkan ponsel hilang atau dicuri</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {isLoading ? (
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 w-3/4 rounded bg-muted"></div>
              <div className="mt-2 h-3 w-1/2 rounded bg-muted"></div>
            </CardContent>
          </Card>
        ) : activePhones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Tidak ada ponsel aktif untuk dilaporkan
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Daftarkan ponsel Anda terlebih dahulu di menu "Ponsel Saya"
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Buat Laporan Kehilangan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="phone">Pilih Ponsel</Label>
                  <Select value={selectedImei} onValueChange={setSelectedImei}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Pilih ponsel yang hilang" />
                    </SelectTrigger>
                    <SelectContent>
                      {activePhones.map((phone) => (
                        <SelectItem key={phone.imei} value={phone.imei}>
                          {phone.brand} {phone.model} - {phone.imei}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Jenis Laporan</Label>
                  <RadioGroup
                    value={reportType}
                    onValueChange={(value) => setReportType(value as 'lost' | 'stolen')}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lost" id="lost" />
                      <Label htmlFor="lost" className="font-normal">
                        Hilang
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stolen" id="stolen" />
                      <Label htmlFor="stolen" className="font-normal">
                        Dicuri
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="location">Lokasi</Label>
                  <div className="mt-1 flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Lokasi kejadian"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getLocation}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Klik ikon lokasi untuk menggunakan lokasi saat ini
                  </p>
                </div>

                <div>
                  <Label htmlFor="details">Detail Kejadian</Label>
                  <Textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Jelaskan kronologi kejadian..."
                    rows={4}
                    required
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                  disabled={reportLostStolen.isPending || !selectedImei || !location || !details}
                >
                  {reportLostStolen.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim Laporan...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Kirim Laporan
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
