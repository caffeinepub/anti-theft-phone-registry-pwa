import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && city) {
      saveProfile.mutate({ email, city });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <img 
            src="/assets/generated/phone-security-icon-transparent.dim_64x64.png" 
            alt="Security Icon" 
            className="mx-auto mb-4 h-16 w-16"
          />
          <h2 className="text-2xl font-bold text-foreground">Selamat Datang!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Lengkapi profil Anda untuk melanjutkan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Masukkan kota Anda"
              required
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending || !name || !email || !city}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              'Simpan Profil'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
