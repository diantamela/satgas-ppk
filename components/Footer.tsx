// Komponen Kaki Halaman
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Informasi Satgas */}
          <div>
            <h5 className="text-lg font-bold mb-3 text-red-400">SATGAS PPKS</h5>
            <p className="text-sm text-gray-400">
              Satuan Tugas Pencegahan dan Penanganan Kekerasan Seksual di lingkungan [Nama Institusi Anda].
            </p>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h5 className="text-lg font-bold mb-3 text-red-400">Navigasi</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/laporan" className="text-gray-400 hover:text-red-300">Lapor Online</Link></li>
              <li><Link href="/edukasi" className="text-gray-400 hover:text-red-300">Pusat Edukasi</Link></li>
              <li><Link href="/tentang" className="text-gray-400 hover:text-red-300">Struktur Satgas</Link></li>
              <li><Link href="/satgas" className="text-gray-400 hover:text-red-300">Dashboard Satgas</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Kontak Darurat (Contoh) */}
          <div>
            <h5 className="text-lg font-bold mb-3 text-red-400">Kontak Darurat</h5>
            <p className="text-sm text-gray-400">
              Hotline: +62 812-XXXX-XXXX
            </p>
            <p className="text-sm text-gray-400">
              Email: satgasppks@[institusi].ac.id
            </p>
          </div>

          {/* Kolom 4: Sosial Media / Lain-lain */}
          <div>
            <h5 className="text-lg font-bold mb-3 text-red-400">Legal</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-red-300">Kebijakan Privasi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-red-300">Syarat & Ketentuan</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Satgas PPKS. All rights reserved.
        </div>
      </div>
    </footer>
  );
};