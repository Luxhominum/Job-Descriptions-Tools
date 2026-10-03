import type { Department } from '../types/job';

export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dept-hr',
    name: 'Human Resources (HR)',
    color: '#8b5cf6', // purple
    description: 'Manajemen Talenta, Rekrutmen, Pengembangan SDM, Hubungan Industrial & Absensi',
  },
  {
    id: 'dept-fat',
    name: 'Finance, Accounting & Purchasing',
    color: '#0284c7', // blue
    description: 'Arus Kas, Pencatatan Akuntansi, Cost Control & HPP, dan Pengadaan Bahan Baku',
  },
  {
    id: 'dept-ops',
    name: 'Operasional & Produksi',
    color: '#059669', // emerald
    description: 'Kesiapan Produk, Gudang, R&D, Potong, Cetak/Printing, Bordir, Jahit & QC',
  },
  {
    id: 'dept-sales',
    name: 'Sales',
    color: '#f59e0b', // amber
    description: 'Target Penjualan, Chat Pelanggan, Administrasi Marketplace, Pesanan Custom & Retensi',
  },
  {
    id: 'dept-mkt',
    name: 'Marketing',
    color: '#ec4899', // pink
    description: 'Strategi Branding, Kalender Kampanye Promosi, Media Sosial & Produksi Konten',
  },
];
