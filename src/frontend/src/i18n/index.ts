type TranslationResources = {
  [key: string]: any;
};

type Language = 'id' | 'en';

class I18n {
  private currentLanguage: Language = 'id';
  private resources: Record<Language, TranslationResources> = {
    id: {},
    en: {},
  };
  private listeners: Set<() => void> = new Set();

  constructor() {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'id' || savedLanguage === 'en')) {
      this.currentLanguage = savedLanguage;
    }
  }

  addResources(language: Language, resources: TranslationResources) {
    this.resources[language] = resources;
  }

  changeLanguage(language: Language) {
    this.currentLanguage = language;
    localStorage.setItem('app-language', language);
    this.listeners.forEach(listener => listener());
  }

  get language() {
    return this.currentLanguage;
  }

  t(key: string): string {
    const keys = key.split('.');
    let value: any = this.resources[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

const i18n = new I18n();

// Add Indonesian translations
i18n.addResources('id', {
  app: {
    loading: 'Memuat aplikasi...',
  },
  login: {
    title: 'Registrasi Anti-Pencurian Ponsel',
    subtitle: 'Lindungi ponsel Anda dan cegah penjualan ponsel curian dengan sistem registrasi terpercaya',
    loginButton: 'Masuk dengan Internet Identity',
    loggingIn: 'Masuk...',
    secureLogin: 'Sistem login aman menggunakan Internet Identity',
    features: {
      register: {
        title: 'Daftarkan Ponsel',
        description: 'Catat kepemilikan ponsel Anda dengan IMEI',
      },
      report: {
        title: 'Laporkan Kehilangan',
        description: 'Laporkan ponsel hilang atau dicuri dengan cepat',
      },
      check: {
        title: 'Cek Status IMEI',
        description: 'Periksa status ponsel sebelum membeli',
      },
      secure: {
        title: 'Aman & Terpercaya',
        description: 'Data tersimpan aman di blockchain',
      },
    },
  },
  tabs: {
    home: 'Beranda',
    phones: 'Ponsel',
    report: 'Lapor',
    check: 'Cek',
    notifications: 'Notif',
    statistics: 'Statistik',
    about: 'Tentang',
    profile: 'Profil',
    admin: 'Admin',
    reportLost: 'Lapor Hilang/Dicuri',
    reportFound: 'Lapor Ditemukan',
  },
  about: {
    title: 'Tentang Aplikasi',
    subtitle: 'Informasi lengkap tentang aplikasi ini',
    purpose: {
      title: 'Tujuan Aplikasi',
      description: 'Aplikasi <strong>Anti-Pencurian Ponsel</strong> dirancang untuk mencegah penjualan ponsel curian dengan menyediakan sistem registrasi kepemilikan yang terpercaya dan transparan.',
      intro: 'Melalui aplikasi ini, pengguna dapat:',
      features: {
        register: 'Mendaftarkan kepemilikan ponsel dengan nomor IMEI',
        check: 'Memeriksa status ponsel melalui pencarian IMEI sebelum membeli',
        report: 'Melaporkan ponsel yang hilang atau dicuri',
        transfer: 'Mentransfer kepemilikan saat menjual ponsel',
      },
    },
    blockchain: {
      title: 'Keunggulan Teknologi Blockchain',
      description: 'Aplikasi ini menggunakan <strong>teknologi blockchain</strong> untuk menjamin integritas data:',
      benefits: {
        tamperProof: {
          title: 'Sulit Dipalsukan',
          description: 'Data tersimpan di blockchain yang tidak dapat diubah atau dimanipulasi',
        },
        transparent: {
          title: 'Transparan',
          description: 'Semua transaksi dan perubahan status dapat dilacak dan diverifikasi',
        },
        secure: {
          title: 'Aman',
          description: 'Sistem terdesentralisasi melindungi dari kegagalan sistem tunggal',
        },
      },
    },
    dataProtection: {
      title: 'Perlindungan Data Pengguna',
      description: 'Privasi dan keamanan data Anda adalah prioritas utama kami:',
      features: {
        encryption: '<strong>Enkripsi Data:</strong> Semua data pengguna dienkripsi menggunakan standar keamanan tinggi',
        anonymization: '<strong>Anonimisasi:</strong> Informasi pribadi dianonimkan untuk melindungi identitas Anda',
        control: '<strong>Kontrol Penuh:</strong> Anda memiliki kontrol penuh atas data yang Anda bagikan',
        noThirdParty: '<strong>Tidak Ada Pihak Ketiga:</strong> Data tidak dibagikan kepada pihak ketiga tanpa izin Anda',
      },
    },
    keyFeatures: {
      title: 'Fitur Utama',
      register: {
        title: 'Registrasi Ponsel',
        description: 'Daftarkan ponsel Anda dengan IMEI untuk mencatat kepemilikan resmi',
      },
      transfer: {
        title: 'Transfer Kepemilikan',
        description: 'Transfer kepemilikan dengan aman saat menjual ponsel Anda',
      },
      check: {
        title: 'Cek IMEI',
        description: 'Periksa status ponsel sebelum membeli untuk menghindari ponsel curian',
      },
      notifications: {
        title: 'Notifikasi Aman',
        description: 'Terima notifikasi real-time tentang aktivitas ponsel Anda',
      },
    },
    help: {
      title: 'Bantuan & Dukungan',
      description: 'Jika Anda memiliki pertanyaan atau memerlukan bantuan, silakan hubungi kami:',
    },
    developer: {
      label: 'Dikembangkan oleh',
    },
  },
  toast: {
    profileSaved: 'Profil berhasil disimpan',
    profileSaveFailed: 'Gagal menyimpan profil',
    pinSet: 'PIN berhasil diatur',
    pinSetFailed: 'Gagal mengatur PIN',
    pinIncorrect: 'PIN saat ini salah',
    inviteGenerated: 'Kode undangan berhasil dibuat',
    inviteGenerateFailed: 'Gagal membuat kode undangan',
    adminOnly: 'Hanya admin yang dapat membuat kode undangan',
    phoneRegistered: 'Ponsel berhasil didaftarkan',
    phoneRegisterFailed: 'Gagal mendaftarkan ponsel',
    releaseSubmitted: 'Permintaan pelepasan kepemilikan berhasil diajukan. Admin akan meninjau permintaan Anda.',
    releaseFailed: 'Gagal melepaskan kepemilikan',
    invalidPin: 'PIN tidak valid. Silakan masukkan PIN 4 digit yang benar.',
    pinRequired: 'Anda harus mengatur PIN 4 digit sebelum dapat melepaskan ponsel. Silakan atur PIN Anda di pengaturan Profil.',
    unauthorizedRelease: 'Hanya pemilik ponsel yang dapat melepaskan kepemilikan',
    reportSubmitted: 'Laporan berhasil dikirim',
    reportFailed: 'Gagal mengirim laporan',
    foundReportSubmitted: 'Laporan penemuan berhasil dikirim! Pemilik akan diberitahu.',
    notificationMarkFailed: 'Gagal menandai notifikasi',
    allNotificationsRead: 'Semua notifikasi ditandai sudah dibaca',
    notificationsMarkFailed: 'Gagal menandai notifikasi',
  },
  footer: {
    copyright: '© 2026 Pasar Digital Community',
  },
});

// Add English translations
i18n.addResources('en', {
  app: {
    loading: 'Loading application...',
  },
  login: {
    title: 'Anti-Theft Phone Registration',
    subtitle: 'Protect your phone and prevent stolen phone sales with a trusted registration system',
    loginButton: 'Login with Internet Identity',
    loggingIn: 'Logging in...',
    secureLogin: 'Secure login system using Internet Identity',
    features: {
      register: {
        title: 'Register Phone',
        description: 'Record your phone ownership with IMEI',
      },
      report: {
        title: 'Report Loss',
        description: 'Report lost or stolen phones quickly',
      },
      check: {
        title: 'Check IMEI Status',
        description: 'Check phone status before buying',
      },
      secure: {
        title: 'Safe & Trusted',
        description: 'Data stored securely on blockchain',
      },
    },
  },
  tabs: {
    home: 'Home',
    phones: 'Phones',
    report: 'Report',
    check: 'Check',
    notifications: 'Notif',
    statistics: 'Statistics',
    about: 'About',
    profile: 'Profile',
    admin: 'Admin',
    reportLost: 'Report Lost/Stolen',
    reportFound: 'Report Found',
  },
  about: {
    title: 'About Application',
    subtitle: 'Complete information about this application',
    purpose: {
      title: 'Application Purpose',
      description: 'The <strong>Anti-Theft Phone</strong> application is designed to prevent the sale of stolen phones by providing a trusted and transparent ownership registration system.',
      intro: 'Through this application, users can:',
      features: {
        register: 'Register phone ownership with IMEI number',
        check: 'Check phone status through IMEI search before buying',
        report: 'Report lost or stolen phones',
        transfer: 'Transfer ownership when selling phones',
      },
    },
    blockchain: {
      title: 'Blockchain Technology Advantages',
      description: 'This application uses <strong>blockchain technology</strong> to ensure data integrity:',
      benefits: {
        tamperProof: {
          title: 'Tamper-Proof',
          description: 'Data stored on blockchain cannot be changed or manipulated',
        },
        transparent: {
          title: 'Transparent',
          description: 'All transactions and status changes can be tracked and verified',
        },
        secure: {
          title: 'Secure',
          description: 'Decentralized system protects against single point of failure',
        },
      },
    },
    dataProtection: {
      title: 'User Data Protection',
      description: 'Your privacy and data security are our top priorities:',
      features: {
        encryption: '<strong>Data Encryption:</strong> All user data is encrypted using high security standards',
        anonymization: '<strong>Anonymization:</strong> Personal information is anonymized to protect your identity',
        control: '<strong>Full Control:</strong> You have full control over the data you share',
        noThirdParty: '<strong>No Third Parties:</strong> Data is not shared with third parties without your permission',
      },
    },
    keyFeatures: {
      title: 'Key Features',
      register: {
        title: 'Phone Registration',
        description: 'Register your phone with IMEI to record official ownership',
      },
      transfer: {
        title: 'Ownership Transfer',
        description: 'Transfer ownership securely when selling your phone',
      },
      check: {
        title: 'Check IMEI',
        description: 'Check phone status before buying to avoid stolen phones',
      },
      notifications: {
        title: 'Secure Notifications',
        description: 'Receive real-time notifications about your phone activities',
      },
    },
    help: {
      title: 'Help & Support',
      description: 'If you have questions or need assistance, please contact us:',
    },
    developer: {
      label: 'Developed by',
    },
  },
  toast: {
    profileSaved: 'Profile saved successfully',
    profileSaveFailed: 'Failed to save profile',
    pinSet: 'PIN set successfully',
    pinSetFailed: 'Failed to set PIN',
    pinIncorrect: 'Current PIN is incorrect',
    inviteGenerated: 'Invite code generated successfully',
    inviteGenerateFailed: 'Failed to generate invite code',
    adminOnly: 'Only admins can generate invite codes',
    phoneRegistered: 'Phone registered successfully',
    phoneRegisterFailed: 'Failed to register phone',
    releaseSubmitted: 'Ownership release request submitted successfully. An admin will review your request.',
    releaseFailed: 'Failed to release ownership',
    invalidPin: 'Invalid PIN. Please enter the correct 4-digit PIN.',
    pinRequired: 'You must set a 4-digit PIN before you can release a phone. Please set your PIN in Profile settings.',
    unauthorizedRelease: 'Only the phone owner can release ownership',
    reportSubmitted: 'Report submitted successfully',
    reportFailed: 'Failed to submit report',
    foundReportSubmitted: 'Found report submitted successfully! The owner will be notified.',
    notificationMarkFailed: 'Failed to mark notification',
    allNotificationsRead: 'All notifications marked as read',
    notificationsMarkFailed: 'Failed to mark notifications',
  },
  footer: {
    copyright: '© 2026 Pasar Digital Community',
  },
});

export default i18n;
